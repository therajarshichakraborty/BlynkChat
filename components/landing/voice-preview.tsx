import { PauseIcon } from "@/components/icons/pause-icon";
import { Waveform } from "@/components/ui/waveform";

const bars = [
  10, 16, 8, 20, 12, 6, 14, 22, 10, 18, 9, 14, 20, 8, 12, 24, 10, 6, 14, 18, 8, 12, 16, 10, 20, 7,
  12, 18, 10, 14,
];

export function VoicePreview() {
  return (
    <div
      aria-hidden="true"
      className="mt-auto flex h-16 items-center gap-3 rounded-lg bg-accent-solid px-4 text-on-accent shadow-accent"
    >
      <span className="inline-grid size-9 shrink-0 place-items-center rounded-full bg-white text-accent-solid">
        <PauseIcon size={16} />
      </span>
      <Waveform bars={bars} played={0.55} className="min-w-0 flex-1 overflow-hidden" />
      <span className="text-sm tabular-nums">0:24</span>
    </div>
  );
}
