import "server-only";
import type { MessageView } from "@/types/message";
import { db } from "../db";
import { invalid, notFound } from "../errors";
import { publish, toConversation } from "../realtime/publish";
import { messageInclude, toMessageView } from "../views/messages";
import { assertCanPost } from "./messages";

export async function toggleReaction(userId: string, messageId: string, emoji: string): Promise<MessageView> {
  const message = await db.message.findUnique({
    where: { id: messageId },
    select: { conversationId: true, deletedAt: true, kind: true },
  });
  if (!message) throw notFound("That message could not be found.");
  await assertCanPost(userId, message.conversationId, { reacting: true });
  if (message.deletedAt || message.kind === "SYSTEM") throw invalid("You can't react to this message.");

  const existing = await db.reaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
    select: { id: true },
  });
  if (existing) await db.reaction.delete({ where: { id: existing.id } });
  else await db.reaction.create({ data: { messageId, userId, emoji } });

  await publish("reaction.changed", { conversationId: message.conversationId, messageId }, toConversation(message.conversationId));
  const row = await db.message.findUniqueOrThrow({ where: { id: messageId }, include: messageInclude(userId) });
  return toMessageView(row, userId);
}
