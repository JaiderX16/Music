import type { RefObject } from 'react';
import { Pause, Play } from 'lucide-react';
import { LiquidGlassButton, TouchableGlassContainer } from '@memoria-labs/liquid-glass';

const RING = 'outline-none focus-visible:ring-2 focus-visible:ring-sky-700 dark:focus-visible:ring-sky-200';

interface GlassPlayButtonProps {
  size: number;
  isPlaying: boolean;
  onClick: () => void;
  domCanvas: HTMLCanvasElement | null;
  pageRef: RefObject<HTMLElement | null>;
  isDark: boolean;
}

export function GlassPlayButton({ size, isPlaying, onClick, domCanvas, pageRef, isDark }: GlassPlayButtonProps) {
  const iconSize = size * 0.36;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      className={`rounded-full ${RING}`}
      style={{ width: size, height: size }}
    >
      <TouchableGlassContainer className="w-full h-full rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        {({ isPressed }) => (
          <>
            <div className={`absolute inset-0 transition-opacity duration-500 ${domCanvas ? 'opacity-100' : 'opacity-0'}`}>
              <LiquidGlassButton domCanvas={domCanvas} pageRef={pageRef} shape="circle" isPressed={isPressed} />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center rounded-full border pointer-events-none ${isDark ? 'border-white/20 text-white' : 'border-black/20 text-neutral-900'}`}>
              {isPlaying ? <Pause size={iconSize} /> : <Play size={iconSize} style={{ marginLeft: Math.max(1, size * 0.05) }} />}
            </div>
          </>
        )}
      </TouchableGlassContainer>
    </button>
  );
}
