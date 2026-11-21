import { AvatarStack } from "@/components/ui/avatar-stack";
import { relativeAgo } from "@/lib/utils/time";
import type { ThreadSummaryView } from "@/types/message";

type ThreadSummaryProps = {
  thread: ThreadSummaryView;
  onOpen?: () => void;
};

export function ThreadSummary({ thread, onOpen }: ThreadSummaryProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="-ml-1 inline-flex items-center gap-2 self-start rounded-md px-1 py-0.5 text-sm transition-colors duration-150 hover:bg-raised"
    >
      <AvatarStack people={thread.participants} size="xs" />
      <span className="font-medium text-accent-text">
        {thread.count} {thread.count === 1 ? "reply" : "replies"}
      </span>
      <span className="text-muted">Last reply {relativeAgo(thread.lastReplyAt)}</span>
    </button>
  );
}
