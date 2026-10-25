interface SliderProps {
  value: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  className?: string;
}

export function Slider({ value, max, step, onChange, ariaLabel, className }: SliderProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const background = `linear-gradient(to right, currentColor ${percent}%, transparent ${percent}%)`;
  return (
    <input
      type="range"
      aria-label={ariaLabel}
      className={`h-1.5 w-full appearance-none cursor-pointer rounded-full bg-neutral-900 dark:bg-white text-neutral-900 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-sky-700 dark:focus-visible:ring-sky-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/10 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black/10 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg ${className ?? ''}`}
      style={{ background }}
      value={value}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}
