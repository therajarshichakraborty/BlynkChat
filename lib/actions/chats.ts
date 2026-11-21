"use server";

import { runAction } from "@/lib/server/action";
import { listConversations, totalUnread } from "@/lib/server/services/conversations";
import { chatListSchema } from "@/lib/validation/chats";
import type { ChatFilter } from "@/types/conversation";

export async function loadChatList(input: { filter: ChatFilter; query: string }) {
  return runAction(chatListSchema, input, async (userId, data) => {
    const [chats, unread] = await Promise.all([
      listConversations(userId, { filter: data.filter, query: data.query }),
      totalUnread(userId),
    ]);
    return { chats, unread };
  });
}
