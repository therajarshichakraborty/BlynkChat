import { AlertCircleIcon } from "@/components/icons/alert-circle-icon";
import { CheckCheckIcon } from "@/components/icons/check-check-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { ClockIcon } from "@/components/icons/clock-icon";
import { cn } from "@/lib/utils/cn";
import type { DeliveryStatus } from "@/types/message";

type MessageMetaProps = {
  time: string;
  dateTime: string;
  status?: DeliveryStatus;
  edited?: boolean;
  outgoing: boolean;
  className?: string;
};

const statusLabel: Record<DeliveryStatus, string> = {
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Not sent",
};

export function MessageMeta({ time, dateTime, status, edited = false, outgoing, className }: MessageMetaProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-2xs tabular-nums",
        outgoing ? "text-on-accent/80" : "text-muted",
        className,
      )}
    >
      {edited ? <span>edited</span> : null}
      <time dateTime={dateTime}>{time}</time>
      {outgoing && status ? (
        <span aria-label={statusLabel[status]} role="img" className={cn(status === "delivered" && "opacity-70")}>
          {status === "read" || status === "delivered" ? <CheckCheckIcon size={14} /> : null}
          {status === "sent" ? <CheckIcon size={14} /> : null}
          {status === "sending" ? <ClockIcon size={12} /> : null}
          {status === "failed" ? <AlertCircleIcon size={13} /> : null}
        </span>
      ) : null}
    </span>
  );
}
