"use client";

import {
  createContext,
  startTransition,
  use,
  useCallback,
  useOptimistic,
  useReducer,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useToast } from "@/components/ui/toast";
import { deleteMessage, editMessage, loadOlderMessages, sendMessage } from "@/lib/actions/messages";
import type { ConversationView, PresenceView } from "@/types/conversation";
import type { AttachmentView, MessagePage, MessageView, SenderView } from "@/types/message";
import { threadReducer, type ThreadAction, type ThreadMessage, type ThreadState } from "./thread-state";

export type SendOptions = {
  attachments?: AttachmentView[];
  threadRootId?: string;
};

type ConversationContextValue = {
  conversation: ConversationView;
  me: SenderView;
  state: ThreadState;
  messages: ThreadMessage[];
  dispatch: (action: ThreadAction) => void;
  loadingOlder: boolean;
  loadOlder: () => void;
  notify: (message: string, tone?: "error" | "success") => void;
  presence: PresenceView | null;
  setPresence: (presence: PresenceView | null) => void;
  typingLabel: string;
  replyingTo: MessageView | null;
  setReplyingTo: (message: MessageView | null) => void;
  editing: MessageView | null;
  setEditing: (message: MessageView | null) => void;
  send: (body: string, options?: SendOptions) => void;
  retry: (message: ThreadMessage) => void;
  saveEdit: (messageId: string, body: string) => void;
  remove: (messageId: string, scope: "me" | "everyone") => void;
};

const ConversationContext = createContext<ConversationContextValue | null>(null);

type ConversationProviderProps = {
  conversation: ConversationView;
  me: SenderView;
  initialPage: MessagePage;
  children: ReactNode;
};

function newClientId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function ConversationProvider({ conversation, me, initialPage, children }: ConversationProviderProps) {
  const { show } = useToast();
  const [state, dispatch] = useReducer(threadReducer, {
    messages: initialPage.messages,
    nextCursor: initialPage.nextCursor,
    receipts: conversation.receipts,
  });
  const [messages, addOptimistic] = useOptimistic(state.messages, (list: ThreadMessage[], draft: ThreadMessage) => [
    ...list.filter((message) => message.clientId !== draft.clientId),
    draft,
  ]);
  const [loadingOlder, startLoading] = useTransition();
  const [presence, setPresence] = useState(conversation.presence);
  const [replyingTo, setReplyingTo] = useState<MessageView | null>(null);
  const [editing, setEditing] = useState<MessageView | null>(null);
  const typingLabel = "";

  const cursor = state.nextCursor;
  const loadOlder = useCallback(() => {
    if (!cursor) return;
    startLoading(async () => {
      const result = await loadOlderMessages({ conversationId: conversation.id, cursor });
      if (result.ok) dispatch({ type: "older", page: result.data });
      else show(result.error.message);
    });
  }, [conversation.id, cursor, show]);

  function deliver(draft: ThreadMessage, replyToId: string | undefined, options: SendOptions) {
    startTransition(async () => {
      addOptimistic(draft);
      const result = await sendMessage({
        conversationId: conversation.id,
        clientId: draft.clientId ?? newClientId(),
        body: draft.body,
        replyToId,
        threadRootId: options.threadRootId,
        attachmentIds: options.attachments?.map((attachment) => attachment.id),
      });
      startTransition(() => {
        if (result.ok) dispatch({ type: "upsert", message: result.data });
        else {
          dispatch({ type: "failed", message: { ...draft, pending: "failed" } });
          show(result.error.message);
        }
      });
    });
  }

  function send(body: string, options: SendOptions = {}) {
    const clientId = newClientId();
    const reply = replyingTo;
    const attachments = options.attachments ?? [];
    const kind = attachments.some((item) => item.kind === "voice")
      ? "voice"
      : attachments.some((item) => item.kind === "image")
        ? "image"
        : attachments.length > 0
          ? "file"
          : "text";
    const draft: ThreadMessage = {
      id: `pending-${clientId}`,
      conversationId: conversation.id,
      clientId,
      sender: me,
      kind,
      body: body.trim(),
      createdAt: new Date().toISOString(),
      editedAt: null,
      deleted: false,
      forwarded: false,
      starred: false,
      pinned: false,
      replyTo: reply
        ? { id: reply.id, author: reply.sender?.id === me.id ? "You" : (reply.sender?.name ?? ""), text: reply.body }
        : null,
      attachments,
      reactions: [],
      poll: null,
      threadRootId: options.threadRootId ?? null,
      thread: null,
      pending: "sending",
    };
    setReplyingTo(null);
    deliver(draft, reply?.id, options);
  }

  function retry(message: ThreadMessage) {
    dispatch({ type: "discard", clientId: message.clientId ?? "" });
    deliver(
      { ...message, pending: "sending", createdAt: new Date().toISOString() },
      message.replyTo?.id,
      { attachments: message.attachments, threadRootId: message.threadRootId ?? undefined },
    );
  }

  function saveEdit(messageId: string, body: string) {
    setEditing(null);
    startTransition(async () => {
      const result = await editMessage({ messageId, body });
      if (result.ok) dispatch({ type: "upsert", message: result.data });
      else show(result.error.message);
    });
  }

  function remove(messageId: string, scope: "me" | "everyone") {
    startTransition(async () => {
      const result = await deleteMessage({ messageId, scope });
      if (!result.ok) show(result.error.message);
      else if (result.data) dispatch({ type: "upsert", message: result.data });
      else dispatch({ type: "hide", messageId });
    });
  }

  return (
    <ConversationContext
      value={{
        conversation,
        me,
        state,
        messages,
        dispatch,
        loadingOlder,
        loadOlder,
        notify: show,
        presence,
        setPresence,
        typingLabel,
        replyingTo,
        setReplyingTo,
        editing,
        setEditing,
        send,
        retry,
        saveEdit,
        remove,
      }}
    >
      {children}
    </ConversationContext>
  );
}

export function useConversation() {
  const value = use(ConversationContext);
  if (!value) throw new Error("useConversation must be used inside ConversationProvider.");
  return value;
}
