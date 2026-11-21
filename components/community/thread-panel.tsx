"use client";

import { startTransition, useEffect, useReducer, useRef, useState } from "react";
import { Composer } from "@/components/chat/composer";
import { useConversation } from "@/components/chat/conversation-provider";
import { threadReducer, type ThreadMessage } from "@/components/chat/thread-state";
import { MessageSquareTextIcon } from "@/components/icons/message-square-text-icon";
import { XIcon } from "@/components/icons/x-icon";
import { useTimeZone } from "@/components/shell/time-zone";
import { IconButton } from "@/components/ui/icon-button";
import { Spinner } from "@/components/ui/spinner";
import { loadThread } from "@/lib/actions/communities";
import { fetchMessage, sendMessage } from "@/lib/actions/messages";
import { useRealtime } from "@/lib/realtime-client";
import { RoomMessage } from "./room-message";

type ThreadPanelProps = {
  root: ThreadMessage;
  onClose: () => void;
};

function newClientId() {
  return typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ThreadPanel({ root, onClose }: ThreadPanelProps) {
  const { conversation, me, notify } = useConversation();
  const timeZone = useTimeZone();
  const [state, dispatch] = useReducer(threadReducer, { messages: [], nextCursor: null, receipts: [] });
  const [loaded, setLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    void loadThread({ rootId: root.id }).then((result) => {
      if (!active) return;
      setLoaded(true);
      if (result.ok) dispatch({ type: "latest", page: { messages: result.data, nextCursor: null } });
      else notify(result.error.message);
    });
    return () => {
      active = false;
    };
  }, [root.id, notify]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [state.messages.length]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function refresh(messageId: string) {
    startTransition(async () => {
      const result = await fetchMessage({ messageId });
      startTransition(() => {
        if (result.ok) dispatch({ type: "upsert", message: result.data });
        else if (result.error.code === "NOT_FOUND") dispatch({ type: "hide", messageId });
      });
    });
  }

  useRealtime((event) => {
    if (!("conversationId" in event.data) || event.data.conversationId !== conversation.id) return;
    if (event.type === "message.created" && event.data.threadRootId === root.id) refresh(event.data.messageId);
    if (
      (event.type === "message.updated" || event.type === "message.deleted" || event.type === "reaction.changed") &&
      state.messages.some((message) => message.id === event.data.messageId)
    ) {
      refresh(event.data.messageId);
    }
  });

  function reply(body: string) {
    const clientId = newClientId();
    const draft: ThreadMessage = {
      ...root,
      id: `pending-${clientId}`,
      clientId,
      sender: me,
      kind: "text",
      body,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deleted: false,
      forwarded: false,
      starred: false,
      pinned: false,
      replyTo: null,
      attachments: [],
      reactions: [],
      poll: null,
      threadRootId: root.id,
      thread: null,
      pending: "sending",
    };
    dispatch({ type: "upsert", message: draft });
    startTransition(async () => {
      const result = await sendMessage({ conversationId: conversation.id, clientId, body, threadRootId: root.id });
      startTransition(() => {
        if (result.ok) dispatch({ type: "upsert", message: result.data });
        else {
          dispatch({ type: "failed", message: { ...draft, pending: "failed" } });
          notify(result.error.message);
        }
      });
    });
  }

  return (
    <>
      <button type="button" aria-label="Close thread" onClick={onClose} className="fixed inset-0 z-30 bg-overlay/40 md:hidden" />
      <aside
        aria-label="Thread"
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-line bg-bg shadow-lg"
      >
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 md:h-18">
          <MessageSquareTextIcon size={20} className="text-accent-text" />
          <div className="min-w-0 flex-1">
            <h2 className="text-md font-semibold">Thread</h2>
            <p className="truncate text-sm text-muted">#{conversation.title}</p>
          </div>
          <IconButton label="Close thread" onClick={onClose}>
            <XIcon size={20} />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          <ol className="flex flex-col gap-5">
            <RoomMessage message={root} timeZone={timeZone} compact />
            <li className="flex items-center gap-3 text-xs text-muted" role="separator">
              <span>
                {state.messages.length} {state.messages.length === 1 ? "reply" : "replies"}
              </span>
              <span className="h-px flex-1 bg-line" />
            </li>
            {!loaded && state.messages.length === 0 ? (
              <li className="flex justify-center py-6 text-muted">
                <Spinner />
              </li>
            ) : null}
            {state.messages.map((message) => (
              <RoomMessage key={message.clientId ?? message.id} message={message} timeZone={timeZone} compact />
            ))}
          </ol>
          <div ref={endRef} />
        </div>
        <div className="px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {conversation.canPost ? (
            <Composer placeholder="Reply in thread…" onSend={reply} inputId="thread-composer" leading={<span className="w-1" />} trailing={null} />
          ) : (
            <p className="py-3 text-center text-sm text-muted">Only admins can reply here.</p>
          )}
        </div>
      </aside>
    </>
  );
}
