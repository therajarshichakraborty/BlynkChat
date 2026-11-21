import { CheckCheckIcon } from "@/components/icons/check-check-icon";
import { RadioIcon } from "@/components/icons/radio-icon";
import { Avatar } from "@/components/ui/avatar";

export function RealtimePreview() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full min-h-52 flex-col gap-3 rounded-lg border border-line bg-surface p-4"
    >
      <div className="flex items-start gap-2.5">
        <Avatar initials="KM" tone="violet" size="sm" />
        <span className="inline-flex items-end gap-2 rounded-lg rounded-tl-xs bg-raised px-3.5 py-2 text-sm">
          Is the build green? 👀
          <span className="text-2xs text-muted">10:01</span>
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-2xs font-semibold text-accent-text uppercase">
          <RadioIcon size={12} />
          Live
        </span>
      </div>
      <div className="relative self-end">
        <span className="inline-flex items-end gap-2 rounded-lg rounded-br-xs bg-accent-solid px-3.5 py-2 text-sm text-on-accent">
          All checks passed, deploying now
          <span className="inline-flex items-center gap-0.5 text-2xs opacity-80">
            10:01
            <CheckCheckIcon size={13} />
          </span>
        </span>
        <span className="absolute right-3 -bottom-3 rounded-full border border-line bg-card px-1.5 text-2xs shadow-xs">
          🚀 👏
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2.5">
        <Avatar initials="KM" tone="violet" size="sm" />
        <span className="inline-flex gap-1 rounded-full bg-raised px-3 py-2.5">
          <span className="size-1.5 rounded-full bg-muted" />
          <span className="size-1.5 rounded-full bg-muted" />
          <span className="size-1.5 rounded-full bg-muted" />
        </span>
      </div>
    </div>
  );
}
