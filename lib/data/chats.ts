import "server-only";
import { cache } from "react";
import { ServiceError } from "@/lib/server/errors";
import {
  getConversationDetails,
  getConversationView,
  listConversations,
  totalUnread,
} from "@/lib/server/services/conversations";
import { listMessages } from "@/lib/server/services/messages";
import type { ChatFilter, ChatSummary, ConversationDetails, ConversationView } from "@/types/conversation";
import type { MessagePage } from "@/types/message";

async function orNull<T>(load: () => Promise<T>): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    if (error instanceof ServiceError && error.code === "NOT_FOUND") return null;
    throw error;
  }
}

export function getChatList(userId: string, filter: ChatFilter, query: string): Promise<ChatSummary[]> {
  return listConversations(userId, { filter, query });
}

export function getUnreadTotal(userId: string): Promise<number> {
  return totalUnread(userId);
}

export const getConversation = cache(
  (userId: string, conversationId: string): Promise<ConversationView | null> =>
    orNull(() => getConversationView(userId, conversationId)),
);

export function getMessagePage(userId: string, conversationId: string, cursor?: string): Promise<MessagePage> {
  return listMessages(userId, conversationId, cursor);
}

export function getConversationInfo(userId: string, conversationId: string): Promise<ConversationDetails> {
  return getConversationDetails(userId, conversationId);
}
