"use client";

import { createContext, startTransition, use, useEffect, useRef, useState, type ReactNode } from "react";
import { loadUnreadTotal } from "@/lib/actions/receipts";
import { useRealtime } from "@/lib/realtime-client";

const UnreadContext = createContext(0);

type UnreadProviderProps = {
  initial: number;
  meId: string;
  children: ReactNode;
};

export function UnreadProvider({ initial, meId, children }: UnreadProviderProps) {
  const [source, setSource] = useState(initial);
  const [count, setCount] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  if (source !== initial) {
    setSource(initial);
    setCount(initial);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  useRealtime((event) => {
    const relevant =
      (event.type === "message.created" && event.data.senderId !== meId && !event.data.threadRootId) ||
      (event.type === "receipt.updated" && event.data.userId === meId) ||
      event.type === "message.deleted" ||
      event.type === "conversation.updated" ||
      event.type === "member.changed";
    if (!relevant) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startTransition(async () => {
        const result = await loadUnreadTotal();
        if (result.ok) startTransition(() => setCount(result.data));
      });
    }, 300);
  });

  return <UnreadContext value={count}>{children}</UnreadContext>;
}

export function useUnreadTotal() {
  return use(UnreadContext);
}
