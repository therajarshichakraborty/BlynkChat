"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const palette = [
  "👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉",
  "😀", "😊", "😍", "🤔", "😎", "🥳", "😅", "🙌",
  "👏", "💯", "✨", "🚀", "👀", "✅", "🤝", "💪",
];

type EmojiPickerProps = {
  label: string;
  icon: ReactNode;
  onPick: (emoji: string) => void;
  emojis?: string[];
  placement?: "top" | "bottom";
  align?: "start" | "end";
  buttonClassName?: string;
};

export function EmojiPicker({
  label,
  icon,
  onPick,
  emojis = palette,
  placement = "top",
  align = "start",
  buttonClassName,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-grid size-8 place-items-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-fg",
          buttonClassName,
        )}
      >
        {icon}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            "absolute z-30 grid w-max grid-cols-8 gap-0.5 rounded-lg border border-line bg-card p-1.5 shadow-lg",
            placement === "top" ? "bottom-full mb-1" : "top-full mt-1",
            align === "start" ? "left-0" : "right-0",
          )}
        >
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={emoji}
              onClick={() => {
                setOpen(false);
                onPick(emoji);
              }}
              className="inline-grid size-9 place-items-center rounded-md text-xl transition-transform duration-150 hover:scale-110 hover:bg-surface"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
