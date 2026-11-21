import { cn } from "@/lib/utils/cn";
import type { ReplyView } from "@/types/message";

type ReplyQuoteProps = {
  reply: Pick<ReplyView, "author" | "text">;
  outgoing: boolean;
  onClick?: () => void;
};

export function ReplyQuote({ reply, outgoing, onClick }: ReplyQuoteProps) {
  const classes = cn(
    "flex flex-col rounded-md border-l-[3px] px-3 py-2 text-left text-sm",
    outgoing ? "border-white/70 bg-white/15" : "border-accent bg-accent-soft",
  );
  const content = (
    <>
      <span className={cn("font-semibold", !outgoing && "text-accent-text")}>{reply.author}</span>
      <span className={cn("line-clamp-2", outgoing ? "text-on-accent/85" : "text-muted")}>{reply.text}</span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  ) : (
    <blockquote className={classes}>{content}</blockquote>
  );
}
