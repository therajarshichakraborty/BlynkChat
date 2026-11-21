"use client";

import { useState } from "react";
import { PinIcon } from "@/components/icons/pin-icon";

type PinnedBarProps = {
  pins: { id: string; text: string }[];
};

export function PinnedBar({ pins }: PinnedBarProps) {
  const [index, setIndex] = useState(0);
  const pin = pins[index % Math.max(1, pins.length)];
  if (!pin) return null;

  function jump() {
    if (!pin) return;
    const element = document.getElementById(`message-${pin.id}`);
    element?.scrollIntoView({ block: "center", behavior: "smooth" });
    if (pins.length > 1) setIndex((value) => (value + 1) % pins.length);
  }

  return (
    <button
      type="button"
      onClick={jump}
      className="flex shrink-0 items-center gap-2.5 border-b border-line bg-accent-soft px-4 py-2.5 text-left text-sm md:px-8 md:text-base"
    >
      <PinIcon size={16} className="shrink-0 text-accent-text" />
      <span className="min-w-0 flex-1 truncate">
        <strong className="font-semibold">Pinned{pins.length > 1 ? ` ${(index % pins.length) + 1} of ${pins.length}` : ""}:</strong>{" "}
        <span className="text-muted">{pin.text}</span>
      </span>
    </button>
  );
}
