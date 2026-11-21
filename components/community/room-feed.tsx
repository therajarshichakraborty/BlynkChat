"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { Composer } from "@/components/chat/composer";
import { DateDivider } from "@/components/chat/date-divider";
import { sendRoomMessage } from "@/lib/data/messages";
import type { RoomMessage as RoomMessageData } from "@/types/community";
import type { User } from "@/types/user";
import { RoomMessage } from "./room-message";

type RoomFeedProps = {
  roomName: string;
  currentUserId: string;
  initialMessages: RoomMessageData[];
  people: Record<string, User>;
  typingLabel?: string;
};

type FeedItem = RoomMessageData & { pending?: boolean };

export function RoomFeed({ roomName, currentUserId, initialMessages, people, typingLabel }: RoomFeedProps) {
  const [messages, setMessages] = useState<FeedItem[]>(initialMessages);
  const [optimistic, addOptimistic] = useOptimistic(messages, (state: FeedItem[], item: FeedItem) => [
    ...state,
    item,
  ]);
  const [, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [optimistic.length]);

  function handleSend(body: string) {
    const draft = { id: `room-${Date.now()}`, authorId: currentUserId, body };
    startTransition(async () => {
      addOptimistic({ id: draft.id, authorId: currentUserId, time: "", segments: [{ type: "text", value: body }], pending: true });
      const saved = await sendRoomMessage(draft);
      startTransition(() => setMessages((current) => [...current, saved]));
    });
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <ol aria-label={`Messages in #${roomName}`} className="flex flex-col gap-6 px-4 py-5 md:px-8">
          <DateDivider label="Today" />
          {optimistic.map((message) => (
            <RoomMessage
              key={message.id}
              message={message}
              author={people[message.authorId]}
              pending={message.pending}
            />
          ))}
        </ol>
        <div ref={endRef} />
      </div>
      <div className="px-3 pb-3 md:px-8 md:pb-5">
        {typingLabel ? (
          <p className="flex items-center gap-2 px-1 pb-2 text-sm text-muted" aria-live="polite">
            <span aria-hidden="true" className="flex gap-0.5">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
            </span>
            {typingLabel}
          </p>
        ) : null}
        <Composer placeholder={`Message #${roomName}`} onSend={handleSend} />
      </div>
    </>
  );
}
