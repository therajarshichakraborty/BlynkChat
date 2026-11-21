import { SmilePlusIcon } from "@/components/icons/smile-plus-icon";
import { Reactions } from "@/components/chat/reactions";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils/cn";
import type { RoomMessage as RoomMessageData } from "@/types/community";
import type { User } from "@/types/user";
import { Poll } from "./poll";
import { RoomMedia } from "./room-media";
import { ThreadSummary } from "./thread-summary";

type RoomMessageProps = {
  message: RoomMessageData;
  author?: User;
  pending?: boolean;
};

export function RoomMessage({ message, author, pending = false }: RoomMessageProps) {
  return (
    <li className={cn("flex gap-3 md:gap-4", pending && "opacity-70")}>
      {author ? <Avatar initials={author.initials} tone={author.tone} size="lg" /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-baseline gap-2">
            <span className="text-md font-semibold">{author?.name ?? "Unknown"}</span>
            <time className="text-xs text-muted">{pending ? "Sending…" : message.time}</time>
          </p>
          <p className="text-md break-words">
            {message.segments.map((segment, index) =>
              segment.type === "code" ? (
                <code
                  key={index}
                  className="rounded-[5px] border border-line bg-surface px-1.5 py-0.5 font-mono text-sm"
                >
                  {segment.value}
                </code>
              ) : (
                <span key={index}>{segment.value}</span>
              ),
            )}
          </p>
        </div>
        {message.poll ? <Poll poll={message.poll} /> : null}
        {message.media ? <RoomMedia media={message.media} /> : null}
        {message.reactions ? (
          <div className="flex items-center gap-1.5">
            <Reactions reactions={message.reactions} size="md" />
            <IconButton label="Add reaction" size="sm" variant="outline" className="rounded-full">
              <SmilePlusIcon size={16} />
            </IconButton>
          </div>
        ) : null}
        {message.thread ? <ThreadSummary thread={message.thread} /> : null}
      </div>
    </li>
  );
}
