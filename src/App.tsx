import { useCallback, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { useLiquidGlassCapture } from '@memoria-labs/liquid-glass';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useTheme } from './hooks/useTheme';
import type { LibraryFilter } from './types';
import { Sidebar } from './components/Sidebar';
import { TrackList } from './components/TrackList';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayer } from './components/FullPlayer';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    tracks,
    currentIndex,
    isPlaying,
    isShuffle,
    repeatMode,
    volume,
    muted,
    currentTime,
    duration,
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
  } = useAudioPlayer();

  const [filter, setFilter] = useState<LibraryFilter>('songs');
  const [query, setQuery] = useState('');
  const [fullOpen, setFullOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const { domCanvas } = useLiquidGlassCapture(pageRef, {
    deps: [theme, tracks.length, filter, query],
    background: '--ui-field',
  });

  const currentTrack = tracks[currentIndex] ?? null;
  const isDark = theme === 'dark';

  const counts = useMemo(
    () => ({
      playlists: tracks.length,
      artists: new Set(tracks.map((t) => t.artist)).size,
      albums: new Set(tracks.map((t) => t.album)).size,
      songs: tracks.length,
    }),
    [tracks],
  );

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      const audioFiles = files.filter((f) => f.type.includes('audio') || f.name.endsWith('.mp3'));
      if (audioFiles.length > 0) addFiles(audioFiles);
    },
    [addFiles],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleFiles],
  );

  return (
    <div
      className="relative min-h-screen bg-(--ui-field) text-neutral-900 dark:text-white"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Sidebar
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        onAddRequest={openFilePicker}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main ref={pageRef} className="md:pl-[352px] pb-40">
        <TrackList
          tracks={tracks}
          filter={filter}
          query={query}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          onPlayTrack={playTrack}
          onRemoveTrack={removeTrack}
          onAddRequest={openFilePicker}
          onQueryChange={setQuery}
        />
      </main>

      <MiniPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        muted={muted}
        shuffle={isShuffle}
        repeatMode={repeatMode}
        fullOpen={fullOpen}
        onTogglePlay={togglePlay}
        onNext={next}
        onPrev={prev}
        onToggleShuffle={toggleShuffle}
        onCycleRepeat={cycleRepeat}
        onOpenFull={() => setFullOpen(true)}
        onToggleMute={toggleMute}
        onVolumeChange={setVolume}
        onSeek={seek}
        domCanvas={domCanvas}
        pageRef={pageRef}
        isDark={isDark}
      />

      <FullPlayer
        open={fullOpen}
        onClose={() => setFullOpen(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        muted={muted}
        shuffle={isShuffle}
        repeatMode={repeatMode}
        onTogglePlay={togglePlay}
        onNext={next}
        onPrev={prev}
        onToggleShuffle={toggleShuffle}
        onCycleRepeat={cycleRepeat}
        onSeek={seek}
        onToggleMute={toggleMute}
        onVolumeChange={setVolume}
        domCanvas={domCanvas}
        pageRef={pageRef}
        isDark={isDark}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          handleFiles(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
