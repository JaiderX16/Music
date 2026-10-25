import type { RefObject } from 'react';
import { ChevronUp, Music, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { LiquidGlassSurface } from '@memoria-labs/liquid-glass';
import { GlassPlayButton } from './GlassPlayButton';
import { Slider } from './Slider';
import { formatTime } from '../hooks/useAudioPlayer';
import type { Track } from '../types';

const INSET = 'bg-black/[0.04] dark:bg-black/[0.20]';
const HAIR = 'border-black/[0.06] dark:border-white/[0.14]';
const T1 = 'text-neutral-900 dark:text-white';
const T3 = 'text-[#46464b] dark:text-white/85';

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeatMode: number;
  fullOpen: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onOpenFull: () => void;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
  onSeek: (percent: number) => void;
  domCanvas: HTMLCanvasElement | null;
  pageRef: RefObject<HTMLElement | null>;
  isDark: boolean;
}

export function MiniPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  shuffle,
  repeatMode,
  fullOpen,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onCycleRepeat,
  onOpenFull,
  onToggleMute,
  onVolumeChange,
  onSeek,
  domCanvas,
  pageRef,
  isDark,
}: MiniPlayerProps) {
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="ignore-capture fixed z-30 bottom-4 left-4 right-4 md:left-[352px] md:right-4 mx-auto max-w-4xl rounded-[28px] overflow-hidden isolate glass">
      <LiquidGlassSurface domCanvas={domCanvas} pageRef={pageRef} radius={28} />
      <div className="relative p-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenFull}
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-4 group"
        >
          <div className={`w-12 h-12 rounded-[16px] ${INSET} border ${HAIR} flex items-center justify-center shrink-0`}>
            <Music className="w-5 h-5 text-[#46464b] dark:text-white/85" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${T1}`}>{track ? track.title : 'Ninguna canción'}</p>
            <p className={`text-xs truncate ${T3}`}>{track ? track.artist : 'Selecciona o agrega música'}</p>
          </div>
        </button>

        <div className="hidden sm:flex flex-col items-center gap-1 w-1/3 max-w-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="pill-btn"
              aria-label="Shuffle"
              aria-pressed={shuffle}
              onClick={onToggleShuffle}
            >
              <Shuffle size={16} />
            </button>
            <button type="button" className="pill-btn" aria-label="Anterior" onClick={onPrev}>
              <SkipBack size={16} />
            </button>
            <GlassPlayButton
              size={44}
              isPlaying={isPlaying}
              onClick={onTogglePlay}
              domCanvas={domCanvas}
              pageRef={pageRef}
              isDark={isDark}
            />
            <button type="button" className="pill-btn" aria-label="Siguiente" onClick={onNext}>
              <SkipForward size={16} />
            </button>
            <button
              type="button"
              className="pill-btn"
              aria-label="Repetir"
              aria-pressed={repeatMode > 0}
              onClick={onCycleRepeat}
            >
              {repeatMode === 2 ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className={`font-mono text-[10px] tabular-nums ${T3}`}>{formatTime(currentTime)}</span>
            <Slider value={progress} max={100} step={0.1} onChange={onSeek} ariaLabel="Progreso" className="w-full" />
            <span className={`font-mono text-[10px] tabular-nums ${T3}`}>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="md:hidden flex items-center gap-2">
            <GlassPlayButton
              size={44}
              isPlaying={isPlaying}
              onClick={onTogglePlay}
              domCanvas={domCanvas}
              pageRef={pageRef}
              isDark={isDark}
            />
            <button type="button" className="pill-btn" aria-label="Abrir reproductor" onClick={onOpenFull}>
              <ChevronUp size={16} />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              className="pill-btn"
              aria-label="Silenciar"
              aria-pressed={muted}
              onClick={onToggleMute}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <Slider
              value={muted ? 0 : volume}
              max={1}
              step={0.01}
              onChange={onVolumeChange}
              ariaLabel="Volumen"
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
