import { SendIcon } from "@/components/icons/send-icon";
import { TrashIcon } from "@/components/icons/trash-icon";
import { IconButton } from "@/components/ui/icon-button";
import { formatDuration } from "@/lib/utils/time";

type RecordingBarProps = {
  elapsedMs: number;
  onCancel: () => void;
  onSend: () => void;
};

export function RecordingBar({ elapsedMs, onCancel, onSend }: RecordingBarProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 rounded-xl border border-accent-line bg-card p-1.5 shadow-md md:p-2"
    >
      <IconButton label="Discard voice message" onClick={onCancel}>
        <TrashIcon size={19} />
      </IconButton>
      <span className="flex flex-1 items-center gap-2.5 px-2 text-md">
        <span className="size-2.5 animate-pulse rounded-full bg-danger" aria-hidden="true" />
        <span className="tabular-nums">{formatDuration(elapsedMs)}</span>
        <span className="text-sm text-muted">Recording voice message…</span>
      </span>
      <IconButton label="Send voice message" variant="accent" onClick={onSend}>
        <SendIcon size={18} />
      </IconButton>
    </div>
  );
}
