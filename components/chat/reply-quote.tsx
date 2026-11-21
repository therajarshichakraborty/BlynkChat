import { cn } from "@/lib/utils/cn";
import type { ReplyQuote as ReplyQuoteData } from "@/types/chat";

type ReplyQuoteProps = {
  reply: ReplyQuoteData;
  outgoing: boolean;
};

export function ReplyQuote({ reply, outgoing }: ReplyQuoteProps) {
  return (
    <blockquote
      className={cn(
        "flex flex-col rounded-md border-l-[3px] px-3 py-2 text-sm",
        outgoing ? "border-white/70 bg-white/15" : "border-accent bg-accent-soft",
      )}
    >
      <span className={cn("font-semibold", !outgoing && "text-accent-text")}>{reply.author}</span>
      <span className={cn("line-clamp-2", outgoing ? "text-on-accent/85" : "text-muted")}>{reply.text}</span>
    </blockquote>
  );
}
