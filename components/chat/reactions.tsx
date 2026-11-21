import { cn } from "@/lib/utils/cn";
import type { ReactionView } from "@/types/message";

type ReactionsProps = {
  reactions: ReactionView[];
  size?: "sm" | "md";
  className?: string;
  onToggle?: (emoji: string) => void;
};

export function Reactions({ reactions, size = "sm", className, onToggle }: ReactionsProps) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Reactions">
      {reactions.map((item) => (
        <li key={item.emoji}>
          <button
            type="button"
            onClick={() => onToggle?.(item.emoji)}
            disabled={!onToggle}
            aria-pressed={item.mine}
            aria-label={`${item.emoji} ${item.count} reactions${item.mine ? ", including you" : ""}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border font-medium tabular-nums shadow-xs transition-colors duration-150 disabled:cursor-default",
              size === "sm" ? "h-6 px-2 text-xs" : "h-8 px-2.5 text-sm",
              item.mine
                ? "border-accent-line bg-accent-soft text-accent-text"
                : "border-line bg-card text-fg hover:bg-surface",
            )}
          >
            <span aria-hidden="true">{item.emoji}</span>
            {item.count}
          </button>
        </li>
      ))}
    </ul>
  );
}
