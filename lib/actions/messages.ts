"use server";

import { runAction } from "@/lib/server/action";
import {
  deleteMessageForEveryone,
  deleteMessageForMe,
  editMessage as editMessageService,
  getMessageView,
  listMessages,
  sendMessage as sendMessageService,
} from "@/lib/server/services/messages";
import {
  conversationIdSchema,
  deleteMessageSchema,
  editMessageSchema,
  loadOlderSchema,
  messageIdSchema,
  sendMessageSchema,
  type SendMessageValues,
} from "@/lib/validation/messages";

export async function loadOlderMessages(input: { conversationId: string; cursor: string }) {
  return runAction(loadOlderSchema, input, (userId, data) => listMessages(userId, data.conversationId, data.cursor));
}

export async function loadLatestMessages(input: { conversationId: string }) {
  return runAction(conversationIdSchema, input, (userId, data) => listMessages(userId, data.conversationId));
}

export async function fetchMessage(input: { messageId: string }) {
  return runAction(messageIdSchema, input, (userId, data) => getMessageView(userId, data.messageId));
}

export async function sendMessage(input: SendMessageValues) {
  return runAction(sendMessageSchema, input, async (userId, data) => {
    const result = await sendMessageService(userId, data);
    return result.message;
  });
}

export async function editMessage(input: { messageId: string; body: string }) {
  return runAction(editMessageSchema, input, async (userId, data) => {
    const result = await editMessageService(userId, data.messageId, data.body);
    return result.message;
  });
}

export async function deleteMessage(input: { messageId: string; scope: "me" | "everyone" }) {
  return runAction(deleteMessageSchema, input, async (userId, data) => {
    if (data.scope === "me") {
      await deleteMessageForMe(userId, data.messageId);
      return null;
    }
    const result = await deleteMessageForEveryone(userId, data.messageId);
    return result.message;
  });
}
