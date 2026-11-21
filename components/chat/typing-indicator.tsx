import { Avatar } from "@/components/ui/avatar";
import type { Tone } from "@/types/tone";

type TypingIndicatorProps = {
  name: string;
  initials: string;
  tone: Tone;
};

export function TypingIndicator({ name, initials, tone }: TypingIndicatorProps) {
  return (
    <li className="flex items-end gap-2.5" aria-live="polite">
      <Avatar initials={initials} tone={tone} size="md" />
      <span className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-bubble px-4">
        <span className="sr-only">{name} is typing</span>
        <span className="size-2 animate-pulse rounded-full bg-faint" />
        <span className="size-2 animate-pulse rounded-full bg-muted [animation-delay:150ms]" />
        <span className="size-2 animate-pulse rounded-full bg-fg/60 [animation-delay:300ms]" />
      </span>
    </li>
  );
}
