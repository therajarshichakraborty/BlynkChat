"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MessageSquareTextIcon } from "@/components/icons/message-square-text-icon";
import { RoomMessage } from "@/components/community/room-message";
import { ThreadPanel } from "@/components/community/thread-panel";
import { markRead } from "@/lib/actions/receipts";
import { useTimeZone } from "@/components/shell/time-zone";
import { Spinner } from "@/components/ui/spinner";
import { deliveryStatus } from "@/lib/utils/messages";
import { ConversationComposer } from "./conversation-composer";
import { ForwardDialog } from "./forward-dialog";
import { useConversation } from "./conversation-provider";
import { MessageActions } from "./message-actions";
import { MessageBubble } from "./message-bubble";
import { MessageList } from "./message-list";
import { SystemMessage } from "./system-message";
import { TypingIndicator } from "./typing-indicator";
import type { ThreadMessage } from "./thread-state";

function firstUnread(messages: ThreadMessage[], lastReadAt: string | null, meId: string) {
  if (!lastReadAt) return { id: null, count: 0 };
  const unread = messages.filter(
    (message) => message.createdAt > lastReadAt && message.sender?.id !== meId && message.kind !== "system",
  );
  return { id: unread[0]?.id ?? null, count: unread.length };
}

type ConversationProps = {
  variant?: "chat" | "room";
};

export function Conversation({ variant = "chat" }: ConversationProps) {
  const {
    conversation,
    me,
    state,
    messages,
    loadOlder,
    loadingOlder,
    typists,
    typingLabel,
    react,
    forwarding,
    setForwarding,
    notify,
  } = useConversation();
  const timeZone = useTimeZone();
  const scrollRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const unreadRef = useRef<HTMLLIElement>(null);
  const heightBeforeLoad = useRef<number | null>(null);
  const [unread] = useState(() => firstUnread(messages, conversation.lastReadAt, me.id));
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [threadRootId, setThreadRootId] = useState<string | null>(null);
  const threadRoot = threadRootId ? messages.find((message) => message.id === threadRootId) : undefined;
  const closeThread = useCallback(() => setThreadRootId(null), []);
  const room = variant === "room";
  const firstId = messages[0]?.id;
  const last = messages.at(-1);
  const lastKey = last ? (last.clientId ?? last.id) : undefined;
  const group = conversation.kind !== "direct";

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (unreadRef.current) unreadRef.current.scrollIntoView({ block: "center" });
    else container.scrollTop = container.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || heightBeforeLoad.current === null) return;
    container.scrollTop += container.scrollHeight - heightBeforeLoad.current;
    heightBeforeLoad.current = null;
  }, [firstId]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container || !lastKey) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 240;
    if (nearBottom || last?.sender?.id === me.id) container.scrollTop = container.scrollHeight;
  }, [lastKey, last?.sender?.id, me.id, typists.length]);

  useEffect(() => {
    const target = topRef.current;
    const container = scrollRef.current;
    if (!target || !container || !state.nextCursor) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !loadingOlder) {
          heightBeforeLoad.current = container.scrollHeight;
          loadOlder();
        }
      },
      { root: container, rootMargin: "200px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [loadOlder, loadingOlder, state.nextCursor]);

  const lastReadable = [...messages].reverse().find((message) => !message.pending);
  const lastReadableId = lastReadable?.id;
  const lastMarked = useRef<string | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !lastReadableId) return;
    function attempt() {
      if (!container || !lastReadableId || lastMarked.current === lastReadableId) return;
      if (document.visibilityState !== "visible" || !document.hasFocus()) return;
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 160;
      if (!nearBottom) return;
      lastMarked.current = lastReadableId;
      void markRead({ conversationId: conversation.id, messageId: lastReadableId });
    }
    const timer = setTimeout(attempt, 400);
    container.addEventListener("scroll", attempt, { passive: true });
    window.addEventListener("focus", attempt);
    document.addEventListener("visibilitychange", attempt);
    return () => {
      clearTimeout(timer);
      container.removeEventListener("scroll", attempt);
      window.removeEventListener("focus", attempt);
      document.removeEventListener("visibilitychange", attempt);
    };
  }, [conversation.id, lastReadableId]);

  useEffect(() => {
    if (!highlighted) return;
    const timer = setTimeout(() => setHighlighted(null), 1600);
    return () => clearTimeout(timer);
  }, [highlighted]);

  function jumpTo(messageId: string) {
    const element = document.getElementById(`message-${messageId}`);
    if (!element) return;
    element.scrollIntoView({ block: "center", behavior: "smooth" });
    setHighlighted(messageId);
  }

  function renderMessage(message: ThreadMessage) {
    if (message.kind === "system") return <SystemMessage key={message.id} text={message.body} />;
    if (room) {
      const threadItems =
        !message.deleted && !message.pending
          ? [
              {
                label: "Reply in thread",
                icon: <MessageSquareTextIcon size={16} />,
                onSelect: () => setThreadRootId(message.id),
              },
            ]
          : [];
      return (
        <RoomMessage
          message={message}
          timeZone={timeZone}
          highlighted={highlighted === message.id}
          onReplyClick={jumpTo}
          onOpenThread={() => setThreadRootId(message.id)}
          onToggleReaction={!message.pending ? (emoji) => react(message, emoji) : undefined}
          actions={
            <MessageActions
              message={message}
              outgoing={message.sender?.id === me.id}
              extraItems={threadItems}
              className="rounded-md border border-line bg-card px-0.5 shadow-sm"
            />
          }
        />
      );
    }
    const outgoing = message.sender?.id === me.id;
    return (
      <MessageBubble
        message={message}
        outgoing={outgoing}
        showAuthor={group && !outgoing}
        timeZone={timeZone}
        highlighted={highlighted === message.id}
        status={outgoing ? (message.pending ?? deliveryStatus(message, state.receipts)) : undefined}
        onReplyClick={jumpTo}
        onToggleReaction={
          conversation.blocked === "none" && !message.pending ? (emoji) => react(message, emoji) : undefined
        }
        actions={<MessageActions message={message} outgoing={outgoing} />}
      />
    );
  }

  return (
    <>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div ref={topRef} aria-hidden="true" />
        {loadingOlder ? (
          <p className="flex justify-center pt-4 text-muted" role="status">
            <Spinner />
            <span className="sr-only">Loading older messages</span>
          </p>
        ) : null}
        {messages.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted">No messages yet. Say hello.</p>
        ) : (
          <MessageList
            messages={messages}
            unreadFromId={unread.id}
            unreadCount={unread.count}
            unreadRef={unreadRef}
            renderMessage={renderMessage}
            className={
              room
                ? "flex flex-col gap-6 px-4 py-5 md:px-8"
                : "mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 py-5 md:px-6"
            }
          >
            {typists[0] && !room ? (
              <TypingIndicator name={typists[0].name} initials={typists[0].initials} tone={typists[0].tone} />
            ) : null}
          </MessageList>
        )}
      </div>
      <div className={room ? "px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-8 md:pb-5" : "px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] md:px-6 md:pb-5"}>
        {room && typingLabel ? (
          <p className="flex items-center gap-2 px-1 pb-2 text-sm text-muted" aria-live="polite">
            <span aria-hidden="true" className="flex gap-0.5">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
            </span>
            {typingLabel}
          </p>
        ) : null}
        <ConversationComposer />
      </div>
      {threadRoot ? <ThreadPanel key={threadRoot.id} root={threadRoot} onClose={closeThread} /> : null}
      {forwarding ? (
        <ForwardDialog messageId={forwarding.id} onClose={() => setForwarding(null)} onDone={notify} />
      ) : null}
    </>
  );
}
