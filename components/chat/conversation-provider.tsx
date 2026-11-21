"use client";

import { createContext, use, useCallback, useReducer, useState, useTransition, type ReactNode } from "react";
import { loadOlderMessages } from "@/lib/actions/messages";
import type { ConversationView, PresenceView } from "@/types/conversation";
import type { MessagePage, SenderView } from "@/types/message";
import { threadReducer, type ThreadAction, type ThreadState } from "./thread-state";

type ConversationContextValue = {
  conversation: ConversationView;
  me: SenderView;
  state: ThreadState;
  dispatch: (action: ThreadAction) => void;
  loadingOlder: boolean;
  loadOlder: () => void;
  error: string;
  setError: (message: string) => void;
  presence: PresenceView | null;
  setPresence: (presence: PresenceView | null) => void;
  typingLabel: string;
};

const ConversationContext = createContext<ConversationContextValue | null>(null);

type ConversationProviderProps = {
  conversation: ConversationView;
  me: SenderView;
  initialPage: MessagePage;
  children: ReactNode;
};

export function ConversationProvider({ conversation, me, initialPage, children }: ConversationProviderProps) {
  const [state, dispatch] = useReducer(threadReducer, {
    messages: initialPage.messages,
    nextCursor: initialPage.nextCursor,
    receipts: conversation.receipts,
  });
  const [loadingOlder, startLoading] = useTransition();
  const [error, setError] = useState("");
  const [presence, setPresence] = useState(conversation.presence);
  const typingLabel = "";

  const cursor = state.nextCursor;
  const loadOlder = useCallback(() => {
    if (!cursor) return;
    startLoading(async () => {
      const result = await loadOlderMessages({ conversationId: conversation.id, cursor });
      if (result.ok) dispatch({ type: "older", page: result.data });
      else setError(result.error.message);
    });
  }, [conversation.id, cursor]);

  return (
    <ConversationContext
      value={{ conversation, me, state, dispatch, loadingOlder, loadOlder, error, setError, presence, setPresence, typingLabel }}
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
