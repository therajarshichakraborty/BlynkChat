"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { Reaction } from "@/types/chat";

type ReactionsProps = {
  reactions: Reaction[];
  size?: "sm" | "md";
  className?: string;
};

export function Reactions({ reactions, size = "sm", className }: ReactionsProps) {
  const [items, setItems] = useState(reactions);

  function toggle(emoji: string) {
    setItems((current) =>
      current.map((item) =>
        item.emoji === emoji
          ? { ...item, mine: !item.mine, count: item.count + (item.mine ? -1 : 1) }
          : item,
      ),
    );
  }

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Reactions">
      {items.map((item) => (
        <li key={item.emoji}>
          <button
            type="button"
            onClick={() => toggle(item.emoji)}
            aria-pressed={item.mine}
            aria-label={`${item.emoji} ${item.count} reactions${item.mine ? ", including you" : ""}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border font-medium tabular-nums shadow-xs transition-colors duration-150",
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
