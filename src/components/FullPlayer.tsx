import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { ChevronDown, Ellipsis, Music, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { LiquidGlassSurface } from '@memoria-labs/liquid-glass';
import { GlassPlayButton } from './GlassPlayButton';
import { Slider } from './Slider';
import { formatTime } from '../hooks/useAudioPlayer';
import type { Track } from '../types';

const INSET = 'bg-black/[0.04] dark:bg-black/[0.20]';
const HAIR = 'border-black/[0.06] dark:border-white/[0.14]';
const T1 = 'text-neutral-900 dark:text-white';
const T3 = 'text-[#46464b] dark:text-white/85';

interface FullPlayerProps {
  open: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeatMode: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onSeek: (percent: number) => void;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
  domCanvas: HTMLCanvasElement | null;
  pageRef: RefObject<HTMLElement | null>;
  isDark: boolean;
}

export function FullPlayer({
  open,
  onClose,
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  shuffle,
  repeatMode,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onCycleRepeat,
  onSeek,
  onToggleMute,
  onVolumeChange,
  domCanvas,
  pageRef,
  isDark,
}: FullPlayerProps) {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
      return;
    }
    const t = window.setTimeout(() => setVisible(false), 300);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!visible) return null;

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="ignore-capture fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-opacity duration-300"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md max-h-[calc(100svh-2rem)] overflow-y-auto isolate glass glass-strong rounded-[48px] p-6 flex flex-col gap-6 transition-all duration-300 ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        {/* El modal flota sobre la UI: lleva cristal líquido. Sus botones de dentro ya no (regla de capas de la librería) */}
        <LiquidGlassSurface domCanvas={domCanvas} pageRef={pageRef} radius={48} />
        <div className="flex items-center justify-between">
          <button type="button" className="pill-btn" aria-label="Cerrar" onClick={onClose}>
            <ChevronDown size={20} />
          </button>
          <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${T3}`}>Reproduciendo ahora</span>
          <button type="button" className="pill-btn" aria-label="Más opciones">
            <Ellipsis size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full aspect-square rounded-[28px] bg-black/[0.04] dark:bg-black/[0.20] border border-black/[0.06] dark:border-white/[0.14] grid place-items-center">
            <Music className="w-16 h-16 text-[#46464b] dark:text-white/85" />
            <div className="absolute -inset-6 rounded-full bg-white/30 dark:bg-white/5 blur-3xl -z-10" />
          </div>
          <div className="w-full text-center px-4">
            <p className={`text-xl font-semibold truncate ${T1}`}>{track ? track.title : 'Ninguna canción'}</p>
            <p className={`text-base truncate ${T3}`}>{track ? track.artist : 'Selecciona o agrega música'}</p>
          </div>
        </div>

        <div className="w-full space-y-2">
          <Slider value={progress} max={100} step={0.1} onChange={onSeek} ariaLabel="Progreso" className="w-full" />
          <div className="flex justify-between font-mono text-[10px] tabular-nums text-neutral-500 dark:text-white/70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full px-6">
          <button type="button" className="pill-btn" aria-label="Shuffle" aria-pressed={shuffle} onClick={onToggleShuffle}>
            <Shuffle size={20} />
          </button>
          <button type="button" className="pill-btn" aria-label="Anterior" onClick={onPrev}>
            <SkipBack size={24} />
          </button>
          <GlassPlayButton
            size={80}
            isPlaying={isPlaying}
            onClick={onTogglePlay}
            domCanvas={domCanvas}
            pageRef={pageRef}
            isDark={isDark}
          />
          <button type="button" className="pill-btn" aria-label="Siguiente" onClick={onNext}>
            <SkipForward size={24} />
          </button>
          <button
            type="button"
            className="pill-btn"
            aria-label="Repetir"
            aria-pressed={repeatMode > 0}
            onClick={onCycleRepeat}
          >
            {repeatMode === 2 ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        <div className="flex items-center justify-center">
          <button type="button" className="pill-btn" aria-label="Silenciar" aria-pressed={muted} onClick={onToggleMute}>
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
