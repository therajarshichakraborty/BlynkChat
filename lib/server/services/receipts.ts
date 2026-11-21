import "server-only";
import { db } from "../db";
import { notFound } from "../errors";
import { publish, toConversation, toUsers } from "../realtime/publish";
import { requireMembership } from "./conversations";

const deliveryDebounceMs = 1000;

const globalForReceipts = globalThis as typeof globalThis & {
  relayDeliveries?: Map<string, ReturnType<typeof setTimeout>>;
};
const pendingDeliveries = globalForReceipts.relayDeliveries ?? new Map<string, ReturnType<typeof setTimeout>>();
globalForReceipts.relayDeliveries = pendingDeliveries;

async function readReceiptsOn(userId: string) {
  const settings = await db.userSettings.findUnique({ where: { userId }, select: { readReceipts: true } });
  return settings?.readReceipts ?? true;
}

export async function markRead(userId: string, conversationId: string, messageId: string) {
  const member = await requireMembership(userId, conversationId);
  const message = await db.message.findUnique({
    where: { id: messageId },
    select: { conversationId: true, createdAt: true },
  });
  if (!message || message.conversationId !== conversationId) throw notFound("That message could not be found.");
  if (member.lastReadAt && member.lastReadAt >= message.createdAt) return { changed: false };

  const lastDeliveredAt =
    member.lastDeliveredAt && member.lastDeliveredAt > message.createdAt ? member.lastDeliveredAt : message.createdAt;
  await db.conversationMember.update({
    where: { id: member.id },
    data: { lastReadMessageId: messageId, lastReadAt: message.createdAt, lastDeliveredAt },
  });

  const data = {
    conversationId,
    userId,
    lastReadAt: message.createdAt.toISOString(),
    lastDeliveredAt: lastDeliveredAt.toISOString(),
  };
  await publish("receipt.updated", data, toUsers([userId]));
  if (member.conversation.type !== "ROOM" && (await readReceiptsOn(userId))) {
    await publish("receipt.updated", data, toConversation(conversationId, [userId]));
  }
  return { changed: true };
}

async function publishDelivered(userId: string, conversationIds: string[], at: Date) {
  for (const conversationId of conversationIds) {
    await publish(
      "receipt.updated",
      { conversationId, userId, lastReadAt: null, lastDeliveredAt: at.toISOString() },
      toConversation(conversationId, [userId]),
    );
  }
}

export async function markAllDelivered(userId: string) {
  const now = new Date();
  const candidates = await db.$queryRaw<{ id: string; conversationId: string }[]>`
    select m.id, m."conversationId"
    from conversation_member m
    join conversation c on c.id = m."conversationId"
    where m."userId" = ${userId}
      and m."leftAt" is null
      and c.type in ('DIRECT', 'GROUP')
      and c."lastMessageAt" > coalesce(m."lastDeliveredAt", to_timestamp(0))
    limit 100`;
  if (candidates.length === 0) return;
  await db.conversationMember.updateMany({
    where: { id: { in: candidates.map((row) => row.id) } },
    data: { lastDeliveredAt: now },
  });
  await publishDelivered(
    userId,
    candidates.map((row) => row.conversationId),
    now,
  );
}

export function noteDelivered(userId: string, conversationId: string) {
  const key = `${userId}:${conversationId}`;
  if (pendingDeliveries.has(key)) return;
  pendingDeliveries.set(
    key,
    setTimeout(() => {
      pendingDeliveries.delete(key);
      void (async () => {
        const now = new Date();
        const updated = await db.conversationMember.updateMany({
          where: { userId, conversationId, leftAt: null, conversation: { type: { in: ["DIRECT", "GROUP"] } } },
          data: { lastDeliveredAt: now },
        });
        if (updated.count > 0) await publishDelivered(userId, [conversationId], now);
      })().catch((error: unknown) => console.error("[relay:receipts]", error));
    }, deliveryDebounceMs),
  );
}
