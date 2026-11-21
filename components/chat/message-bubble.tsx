import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import type { Message } from "@/types/chat";
import type { User } from "@/types/user";
import { FileAttachment } from "./file-attachment";
import { ImageAttachment } from "./image-attachment";
import { MessageMeta } from "./message-meta";
import { Reactions } from "./reactions";
import { ReplyQuote } from "./reply-quote";
import { VoiceNote } from "./voice-note";

type MessageBubbleProps = {
  message: Message;
  author?: User;
  outgoing: boolean;
  showAuthor: boolean;
};

export function MessageBubble({ message, author, outgoing, showAuthor }: MessageBubbleProps) {
  const meta = (
    <MessageMeta time={message.time} status={message.status} outgoing={outgoing} />
  );
  const hasMedia = Boolean(message.file || message.image);

  return (
    <li className={cn("flex items-start gap-2.5", outgoing && "justify-end", message.reactions && "pb-3")}>
      {!outgoing && author ? (
        <Avatar initials={author.initials} tone={author.tone} size="md" className="mt-0.5" />
      ) : null}
      <div
        className={cn(
          "relative flex max-w-[min(85%,560px)] flex-col gap-2 rounded-xl text-md",
          hasMedia ? "p-2 pb-2.5" : "px-4 py-2.5",
          message.voice && "min-w-64 px-3",
          outgoing
            ? "rounded-br-xs bg-accent-solid text-on-accent shadow-xs"
            : "rounded-tl-xs bg-bubble text-fg",
          message.status === "sending" && "opacity-80",
        )}
      >
        {showAuthor && author ? (
          <span className={cn("text-sm font-semibold text-accent-text", hasMedia && "px-2")}>
            {author.firstName}
          </span>
        ) : null}
        {message.replyTo ? <ReplyQuote reply={message.replyTo} outgoing={outgoing} /> : null}
        {message.file ? <FileAttachment file={message.file} /> : null}
        {message.image ? <ImageAttachment image={message.image} /> : null}
        {message.voice ? (
          <>
            <VoiceNote voice={message.voice} outgoing={outgoing} />
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
        {message.reactions ? (
          <Reactions
            reactions={message.reactions}
            className={cn("absolute -bottom-4", outgoing ? "left-3" : "right-3")}
          />
        ) : null}
      </div>
    </li>
  );
}
