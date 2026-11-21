"use server";

import { runAction } from "@/lib/server/action";
import { getMessageView, listMessages } from "@/lib/server/services/messages";
import { loadOlderSchema, messageIdSchema } from "@/lib/validation/messages";

export async function loadOlderMessages(input: { conversationId: string; cursor: string }) {
  return runAction(loadOlderSchema, input, (userId, data) => listMessages(userId, data.conversationId, data.cursor));
}

export async function fetchMessage(input: { messageId: string }) {
  return runAction(messageIdSchema, input, (userId, data) => getMessageView(userId, data.messageId));
}
