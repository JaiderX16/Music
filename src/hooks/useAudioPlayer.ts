import { useCallback, useEffect, useRef, useState } from 'react';
import type { Track } from '../types';

export type RepeatMode = 0 | 1 | 2;

export function formatTime(seconds: number): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

interface PlayerState {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
}

export function useAudioPlayer() {
  // Un solo <audio> para toda la vida del componente (sin crear uno nuevo en cada render)
  const audioRef = useRef<HTMLAudioElement>(null as unknown as HTMLAudioElement);
  if (!audioRef.current) audioRef.current = new Audio();
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const isOfflineRef = useRef(false);

  const stateRef = useRef<PlayerState>({
    tracks: [],
    currentIndex: -1,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 0,
  });
  stateRef.current = { tracks, currentIndex, isPlaying, isShuffle, repeatMode };
  isOfflineRef.current = isOffline;

  const resolveOfflineSrc = useCallback(async (src: string): Promise<string> => {
    const isRemote = src.startsWith('http://') || src.startsWith('https://');
    if (!isOfflineRef.current || !isRemote) return src;
    try {
      const cache = await caches.open('music-offline-v1');
      const url = new URL(src, window.location.href);
      const cached = await cache.match(url);
      const response = cached
        ? cached
        : await (async () => {
            const res = await fetch(src);
            const blob = await res.blob();
            await cache.put(url, new Response(blob));
            return new Response(blob);
          })();
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      objectUrlsRef.current.add(objectUrl);
      return objectUrl;
    } catch {
      return src;
    }
  }, []);

  const loadTrack = useCallback(async (index: number, autoplay: boolean, source: Track[] = stateRef.current.tracks) => {
    if (source.length === 0) return;
    const track = source[index];
    if (!track) return;
    const audio = audioRef.current;
    setCurrentIndex(index);
    const src = await resolveOfflineSrc(track.src);
    audio.src = src;
    audio.load();
    setCurrentTime(0);
    if (autoplay) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    } else {
      setIsPlaying(false);
    }
  }, [resolveOfflineSrc]);

  const playTrack = useCallback(
    (index: number) => {
      void loadTrack(index, true);
    },
    [loadTrack],
  );

  const togglePlay = useCallback(() => {
    const s = stateRef.current;
    if (s.tracks.length === 0) return;
    const audio = audioRef.current;
    if (s.isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    const play = async () => {
      let src = audio.src;
      if (isOfflineRef.current) {
        const track = s.tracks[s.currentIndex];
        if (track) src = await resolveOfflineSrc(track.src);
      }
      audio.src = src;
      audio.load();
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    };
    void play();
  }, [resolveOfflineSrc]);

  const next = useCallback(() => {
    const s = stateRef.current;
    const audio = audioRef.current;
    if (s.tracks.length === 0) return;
    const lastIndex = s.tracks.length - 1;
    if (s.repeatMode === 0 && !s.isShuffle && s.currentIndex >= lastIndex) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    const nextIndex = s.isShuffle
      ? Math.floor(Math.random() * s.tracks.length)
      : (s.currentIndex + 1) % s.tracks.length;
    void loadTrack(nextIndex, true, s.tracks);
  }, [loadTrack]);

  const prev = useCallback(() => {
    const s = stateRef.current;
    if (s.tracks.length === 0) return;
    const index = s.currentIndex - 1 < 0 ? s.tracks.length - 1 : s.currentIndex - 1;
    void loadTrack(index, true);
  }, [loadTrack]);

  const seek = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = (percent / 100) * audio.duration;
  }, []);

  const setVolume = useCallback((v: number) => {
    const value = Math.min(1, Math.max(0, v));
    setVolumeState(value);
    const audio = audioRef.current;
    audio.volume = value;
    if (value > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    const nextMuted = !audio.muted;
    setMuted(nextMuted);
    audio.muted = nextMuted;
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => ((m + 1) % 3) as RepeatMode);
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const accepted = files.filter((f) => f.type.includes('audio') || f.name.endsWith('.mp3'));
      const newTracks: Track[] = accepted.map((file) => {
        const objectUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(objectUrl);
        let title = file.name.replace(/\.[^/.]+$/, '');
        let artist = 'Artista desconocido';
        let album = 'Álbum local';
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          artist = parts[0].trim();
          title = parts[1].trim();
        }
        return { id: crypto.randomUUID(), title, artist, album, src: objectUrl };
      });
      if (newTracks.length === 0) return;
      const wasEmpty = stateRef.current.tracks.length === 0;
      setTracks((prev) => [...prev, ...newTracks]);
      if (wasEmpty) {
        const first = newTracks[0];
        setCurrentIndex(0);
        setIsPlaying(false);
        const audio = audioRef.current;
        audio.src = first.src;
        audio.load();
      }
    },
    [],
  );

  const removeTrack = useCallback(
    (index: number) => {
      const audio = audioRef.current;
      const s = stateRef.current;
      const track = s.tracks[index];
      if (track) {
        objectUrlsRef.current.delete(track.src);
        URL.revokeObjectURL(track.src);
      }
      const nextTracks = s.tracks.filter((_, i) => i !== index);
      setTracks(nextTracks);
      if (nextTracks.length === 0) {
        audio.pause();
        audio.src = '';
        setCurrentIndex(-1);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        return;
      }
      // Quitar otra pista no corta la que suena: solo se corrige el índice
      if (index !== s.currentIndex) {
        if (index < s.currentIndex) setCurrentIndex(s.currentIndex - 1);
        return;
      }
      const nextIndex = Math.min(index, nextTracks.length - 1);
      setCurrentIndex(nextIndex);
      void loadTrack(nextIndex, s.isPlaying, nextTracks);
    },
    [loadTrack],
  );

  useEffect(() => {
    const audio = audioRef.current;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const onEnded = () => {
      const s = stateRef.current;
      const audio = audioRef.current;
      if (s.repeatMode === 2) {
        audio.currentTime = 0;
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
        return;
      }
      const lastIndex = s.tracks.length - 1;
      if (s.repeatMode === 0 && !s.isShuffle && s.currentIndex >= lastIndex) {
        audio.pause();
        setIsPlaying(false);
        return;
      }
      const nextIndex = s.isShuffle
        ? Math.floor(Math.random() * s.tracks.length)
        : (s.currentIndex + 1) % s.tracks.length;
      void loadTrack(nextIndex, true, s.tracks);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [loadTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio.pause();
      audio.src = '';
      for (const url of objectUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      objectUrlsRef.current.clear();
    };
  }, []);

  const toggleOffline = useCallback(() => {
    setIsOffline((prev) => !prev);
  }, []);

  return {
    tracks,
    currentIndex,
    isPlaying,
    isShuffle,
    repeatMode,
    volume,
    muted,
    currentTime,
    duration,
    isOffline,
    addFiles,
    playTrack,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    removeTrack,
    toggleOffline,
    formatTime,
  };
}
