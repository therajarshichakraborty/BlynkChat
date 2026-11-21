"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { sendMessage } from "@/lib/data/messages";
import type { Message } from "@/types/chat";
import type { User } from "@/types/user";
import { Composer } from "./composer";
import { MessageList } from "./message-list";

type ConversationProps = {
  chatId: string;
  currentUserId: string;
  initialMessages: Message[];
  people: Record<string, User>;
  group: boolean;
  typing?: User;
  placeholder: string;
};

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function Conversation({
  chatId,
  currentUserId,
  initialMessages,
  people,
  group,
  typing,
  placeholder,
}: ConversationProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state: Message[], pending: Message) => [...state, pending],
  );
  const [, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [optimisticMessages.length]);

  function handleSend(body: string) {
    const draft = {
      id: `${chatId}-${Date.now()}`,
      chatId,
      authorId: currentUserId,
      body,
      time: currentTime(),
    };
    startTransition(async () => {
      addOptimistic({ ...draft, day: "Today", status: "sending" });
      const saved = await sendMessage(draft);
      startTransition(() => setMessages((current) => [...current, saved]));
    });
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <MessageList
          messages={optimisticMessages}
          people={people}
          currentUserId={currentUserId}
          group={group}
          typing={typing}
        />
        <div ref={endRef} />
      </div>
      <div className="px-3 pt-2 pb-3 md:px-6 md:pb-5">
        <Composer placeholder={placeholder} onSend={handleSend} />
      </div>
    </>
  );
}
