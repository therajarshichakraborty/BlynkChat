import type { Ref } from "react";

type UnreadDividerProps = {
  count: number;
  ref?: Ref<HTMLLIElement>;
};

export function UnreadDivider({ count, ref }: UnreadDividerProps) {
  return (
    <li ref={ref} className="flex items-center gap-3 py-2" role="separator" aria-label={`${count} unread messages`}>
      <span className="h-px flex-1 bg-accent-line" />
      <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-text">
        {count} unread {count === 1 ? "message" : "messages"}
      </span>
      <span className="h-px flex-1 bg-accent-line" />
    </li>
  );
}
