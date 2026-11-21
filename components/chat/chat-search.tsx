"use client";

import { useEffect, useRef } from "react";
import { SearchInput } from "@/components/ui/search-input";

type ChatSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ChatSearch({ value, onChange }: ChatSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <SearchInput
      ref={inputRef}
      label="Search chats"
      shortcut="⌘K"
      placeholder="Search chats, people, rooms"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
