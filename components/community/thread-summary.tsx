import { AvatarStack } from "@/components/ui/avatar-stack";
import type { ThreadSummary as ThreadSummaryData } from "@/types/community";

type ThreadSummaryProps = {
  thread: ThreadSummaryData;
};

export function ThreadSummary({ thread }: ThreadSummaryProps) {
  return (
    <button
      type="button"
      className="-ml-1 inline-flex items-center gap-2 self-start rounded-md px-1 py-0.5 text-sm transition-colors duration-150 hover:bg-raised"
    >
      <AvatarStack people={thread.participants} size="xs" />
      <span className="font-medium text-accent-text">{thread.count} replies</span>
      <span className="text-muted">{thread.lastReply}</span>
    </button>
  );
}
