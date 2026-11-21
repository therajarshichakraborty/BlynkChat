"use client";

import { PinIcon } from "@/components/icons/pin-icon";

type PinnedBarProps = {
  messageId: string;
  text: string;
};

export function PinnedBar({ messageId, text }: PinnedBarProps) {
  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById(`message-${messageId}`)?.scrollIntoView({ block: "center", behavior: "smooth" })
      }
      className="flex items-center gap-2.5 border-b border-line bg-accent-soft px-4 py-2.5 text-left text-sm md:px-8 md:text-base"
    >
      <PinIcon size={16} className="shrink-0 text-accent-text" />
      <span className="min-w-0 truncate">
        <strong className="font-semibold">Pinned:</strong> <span className="text-muted">{text}</span>
      </span>
    </button>
  );
}
