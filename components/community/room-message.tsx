import type { ReactNode } from "react";
import { FileAttachment } from "@/components/chat/file-attachment";
import { ImageAttachment } from "@/components/chat/image-attachment";
import { Reactions } from "@/components/chat/reactions";
import { ReplyQuote } from "@/components/chat/reply-quote";
import type { ThreadMessage } from "@/components/chat/thread-state";
import { VoiceNote } from "@/components/chat/voice-note";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { clockLabel } from "@/lib/utils/time";
import { ThreadSummary } from "./thread-summary";

type RoomMessageProps = {
  message: ThreadMessage;
  timeZone: string;
  highlighted?: boolean;
  actions?: ReactNode;
  poll?: ReactNode;
  reactionPicker?: ReactNode;
  onToggleReaction?: (emoji: string) => void;
  onOpenThread?: () => void;
  onReplyClick?: (messageId: string) => void;
  compact?: boolean;
};

function segments(body: string) {
  return body.split(/(`[^`\n]+`)/g).filter(Boolean);
}

export function RoomMessage({
  message,
  timeZone,
  highlighted = false,
  actions,
  poll,
  reactionPicker,
  onToggleReaction,
  onOpenThread,
  onReplyClick,
  compact = false,
}: RoomMessageProps) {
  const author = message.sender;
  const images = message.attachments.filter((attachment) => attachment.kind === "image");
  const files = message.attachments.filter((attachment) => attachment.kind === "file");
  const voice = message.attachments.find((attachment) => attachment.kind === "voice");

  return (
    <li
      id={`message-${message.id}`}
      className={cn(
        "group/message relative flex scroll-mt-20 gap-3 rounded-lg transition-colors duration-500 md:gap-4",
        message.pending === "sending" && "opacity-70",
        message.pending === "failed" && "opacity-80",
        highlighted && "bg-accent-soft",
      )}
    >
      {author ? (
        <Avatar initials={author.initials} tone={author.tone} image={author.image} size={compact ? "md" : "lg"} />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <p className="flex items-baseline gap-2">
            <span className="text-md font-semibold">{author?.name ?? "Deleted account"}</span>
            <time dateTime={message.createdAt} className="text-xs text-muted">
              {message.pending === "sending"
                ? "Sending…"
                : message.pending === "failed"
                  ? "Not sent"
                  : clockLabel(message.createdAt, timeZone)}
            </time>
            {message.editedAt && !message.deleted ? <span className="text-xs text-muted">edited</span> : null}
            {message.forwarded && !message.deleted ? <span className="text-xs text-muted italic">Forwarded</span> : null}
          </p>
          {message.replyTo && !message.deleted ? (
            <div className="my-1 max-w-xl">
              <ReplyQuote
                reply={message.replyTo}
                outgoing={false}
                onClick={onReplyClick ? () => onReplyClick(message.replyTo?.id ?? "") : undefined}
              />
            </div>
          ) : null}
          {message.deleted ? (
            <p className="text-md text-muted italic">This message was deleted</p>
          ) : message.body && message.kind !== "poll" ? (
            <p className="text-md break-words whitespace-pre-wrap">
              {segments(message.body).map((segment, index) =>
                segment.startsWith("`") && segment.endsWith("`") && segment.length > 2 ? (
                  <code key={index} className="rounded-[5px] border border-line bg-surface px-1.5 py-0.5 font-mono text-sm">
                    {segment.slice(1, -1)}
                  </code>
                ) : (
                  <span key={index}>{segment}</span>
                ),
              )}
            </p>
          ) : null}
        </div>
        {poll}
        {images.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((image) => (
              <ImageAttachment key={image.id} image={image} />
            ))}
          </div>
        ) : null}
        {files.map((file) => (
          <div key={file.id} className="max-w-sm">
            <FileAttachment file={file} />
          </div>
        ))}
        {voice ? (
          <div className="w-72 max-w-full rounded-xl bg-bubble px-3 py-2.5">
            <VoiceNote voice={voice} outgoing={false} />
          </div>
        ) : null}
        {message.reactions.length > 0 ? (
          <div className="flex items-center gap-1.5">
            <Reactions reactions={message.reactions} size="md" onToggle={onToggleReaction} />
            {reactionPicker}
          </div>
        ) : null}
        {message.thread && onOpenThread ? <ThreadSummary thread={message.thread} onOpen={onOpenThread} /> : null}
      </div>
      {actions ? <div className="absolute -top-3 right-0">{actions}</div> : null}
    </li>
  );
}
