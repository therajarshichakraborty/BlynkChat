import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { firstName } from "@/lib/utils/messages";
import { clockLabel } from "@/lib/utils/time";
import type { DeliveryStatus } from "@/types/message";
import { FileAttachment } from "./file-attachment";
import { ImageAttachment } from "./image-attachment";
import { MessageMeta } from "./message-meta";
import { Reactions } from "./reactions";
import { ReplyQuote } from "./reply-quote";
import type { ThreadMessage } from "./thread-state";
import { VoiceNote } from "./voice-note";

type MessageBubbleProps = {
  message: ThreadMessage;
  outgoing: boolean;
  showAuthor: boolean;
  status?: DeliveryStatus;
  timeZone: string;
  highlighted?: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
  onToggleReaction?: (emoji: string) => void;
  onReplyClick?: (messageId: string) => void;
};

export function MessageBubble({
  message,
  outgoing,
  showAuthor,
  status,
  timeZone,
  highlighted = false,
  actions,
  footer,
  onToggleReaction,
  onReplyClick,
}: MessageBubbleProps) {
  const author = message.sender;
  const meta = (
    <MessageMeta
      time={clockLabel(message.createdAt, timeZone)}
      dateTime={message.createdAt}
      status={status}
      edited={message.editedAt !== null && !message.deleted}
      outgoing={outgoing}
    />
  );
  const images = message.attachments.filter((attachment) => attachment.kind === "image");
  const files = message.attachments.filter((attachment) => attachment.kind === "file");
  const voice = message.attachments.find((attachment) => attachment.kind === "voice");
  const hasMedia = images.length > 0 || files.length > 0;
  const hasReactions = message.reactions.length > 0;

  return (
    <li
      id={`message-${message.id}`}
      className={cn(
        "group/message flex scroll-mt-20 items-start gap-2.5 rounded-xl transition-colors duration-500",
        outgoing && "justify-end",
        hasReactions && "pb-3",
        highlighted && "bg-accent-soft",
      )}
    >
      {!outgoing && author ? (
        <Avatar initials={author.initials} tone={author.tone} size="md" className="mt-0.5" />
      ) : null}
      {outgoing ? actions : null}
      <div
        className={cn(
          "relative flex max-w-[min(85%,560px)] flex-col gap-2 rounded-xl text-md",
          hasMedia ? "p-2 pb-2.5" : "px-4 py-2.5",
          voice && "min-w-64 px-3",
          outgoing ? "rounded-br-xs bg-accent-solid text-on-accent shadow-xs" : "rounded-tl-xs bg-bubble text-fg",
          message.pending === "sending" && "opacity-80",
          message.pending === "failed" && "ring-2 ring-danger",
        )}
      >
        {showAuthor && author ? (
          <span className={cn("text-sm font-semibold text-accent-text", hasMedia && "px-2")}>
            {firstName(author.name)}
          </span>
        ) : null}
        {message.forwarded && !message.deleted ? (
          <span className={cn("text-xs italic", outgoing ? "text-on-accent/80" : "text-muted", hasMedia && "px-2")}>
            Forwarded
          </span>
        ) : null}
        {message.replyTo && !message.deleted ? (
          <ReplyQuote
            reply={message.replyTo}
            outgoing={outgoing}
            onClick={onReplyClick ? () => onReplyClick(message.replyTo?.id ?? "") : undefined}
          />
        ) : null}
        {images.map((image) => (
          <ImageAttachment key={image.id} image={image} />
        ))}
        {files.map((file) => (
          <FileAttachment key={file.id} file={file} />
        ))}
        {message.deleted ? (
          <p className={cn("italic", outgoing ? "text-on-accent/85" : "text-muted")}>
            {outgoing ? "You deleted this message" : "This message was deleted"}
            <span className="float-right mt-1.5 ml-3 translate-y-1">{meta}</span>
          </p>
        ) : voice ? (
          <>
            <VoiceNote voice={voice} outgoing={outgoing} />
            <span className="self-end">{meta}</span>
          </>
        ) : message.body ? (
          <p className={cn("break-words whitespace-pre-wrap", hasMedia && "px-2")}>
            {message.body}
            <span className="float-right mt-1.5 ml-3 translate-y-1">{meta}</span>
          </p>
        ) : (
          <span className="self-end px-1">{meta}</span>
        )}
        {footer}
        {hasReactions ? (
          <Reactions
            reactions={message.reactions}
            onToggle={onToggleReaction}
            className={cn("absolute -bottom-4", outgoing ? "left-3" : "right-3")}
          />
        ) : null}
      </div>
      {outgoing ? null : actions}
    </li>
  );
}
