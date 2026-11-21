"use server";

import { runAction } from "@/lib/server/action";
import { totalUnread } from "@/lib/server/services/conversations";
import { markRead as markReadService } from "@/lib/server/services/receipts";
import { markReadSchema } from "@/lib/validation/messages";
import { z } from "zod";

export async function markRead(input: { conversationId: string; messageId: string }) {
  return runAction(markReadSchema, input, (userId, data) => markReadService(userId, data.conversationId, data.messageId));
}

export async function loadUnreadTotal() {
  return runAction(z.object({}), {}, (userId) => totalUnread(userId));
}
