import { cn } from "@/lib/utils/cn";

type WaveformProps = {
  bars: number[];
  played?: number;
  className?: string;
};

export function Waveform({ bars, played = 0, className }: WaveformProps) {
  const cutoff = Math.round(bars.length * played);
  return (
    <span aria-hidden="true" className={cn("flex h-6 items-center gap-[2px]", className)}>
      {bars.map((height, index) => (
        <span
          key={index}
          className={cn(
            "w-[2px] shrink-0 rounded-full bg-current",
            played > 0 && index >= cutoff && "opacity-50",
          )}
          style={{ height: `${Math.max(3, height)}px` }}
        />
      ))}
    </span>
  );
}
