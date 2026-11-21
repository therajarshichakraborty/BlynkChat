import { CheckCheckIcon } from "@/components/icons/check-check-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { cn } from "@/lib/utils/cn";
import type { DeliveryStatus } from "@/types/chat";

type MessageMetaProps = {
  time: string;
  status?: DeliveryStatus;
  outgoing: boolean;
  className?: string;
};

const statusLabel: Record<DeliveryStatus, string> = {
  sending: "Sending",
  sent: "Sent",
  read: "Read",
};

export function MessageMeta({ time, status, outgoing, className }: MessageMetaProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-2xs tabular-nums",
        outgoing ? "text-on-accent/80" : "text-muted",
        className,
      )}
    >
      <time>{time}</time>
      {outgoing && status ? (
        <span aria-label={statusLabel[status]} role="img">
          {status === "read" ? <CheckCheckIcon size={14} /> : null}
          {status === "sent" ? <CheckIcon size={14} /> : null}
          {status === "sending" ? <ClockIcon size={12} /> : null}
        </span>
      ) : null}
    </span>
  );
}
