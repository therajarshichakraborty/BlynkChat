"use server";

import { runAction } from "@/lib/server/action";
import { getOrCreateDirect, listConversations, totalUnread } from "@/lib/server/services/conversations";
import { listContacts } from "@/lib/server/services/users";
import { z } from "zod";
import { idSchema } from "@/lib/validation/common";
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

export async function loadContacts() {
  return runAction(z.object({}), {}, (userId) => listContacts(userId));
}

export async function startDirectChat(input: { userId: string }) {
  return runAction(z.object({ userId: idSchema }), input, async (userId, data) => ({
    id: await getOrCreateDirect(userId, data.userId),
  }));
}
