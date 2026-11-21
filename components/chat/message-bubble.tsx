import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import type { Message } from "@/types/chat";
import type { User } from "@/types/user";
import { MessageMeta } from "./message-meta";

type MessageBubbleProps = {
  message: Message;
  author?: User;
  outgoing: boolean;
  showAuthor: boolean;
};

export function MessageBubble({ message, author, outgoing, showAuthor }: MessageBubbleProps) {
  return (
    <li className={cn("flex items-start gap-2.5", outgoing && "justify-end")}>
      {!outgoing && author ? (
        <Avatar initials={author.initials} tone={author.tone} size="md" className="mt-0.5" />
      ) : null}
      <div
        className={cn(
          "relative flex max-w-[min(85%,560px)] flex-col gap-1 rounded-xl px-4 py-2.5 text-md",
          outgoing
            ? "rounded-br-xs bg-accent-solid text-on-accent shadow-xs"
            : "rounded-tl-xs bg-bubble text-fg",
          message.status === "sending" && "opacity-80",
        )}
      >
        {showAuthor && author ? (
          <span className="text-sm font-semibold text-accent-text">{author.firstName}</span>
        ) : null}
        <p className="break-words whitespace-pre-wrap">
          {message.body}
          <MessageMeta
            time={message.time}
            status={message.status}
            outgoing={outgoing}
            className="float-right mt-1.5 ml-3 translate-y-1"
          />
        </p>
      </div>
    </li>
  );
}
