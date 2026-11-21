import "server-only";
import { db } from "../db";
import { forbidden, invalid, notFound } from "../errors";
import { publish, toConversation } from "../realtime/publish";
import { isAdminRole, requireMembership } from "./conversations";

const maxPins = 3;

export async function togglePin(userId: string, messageId: string) {
  const message = await db.message.findUnique({
    where: { id: messageId },
    select: { id: true, conversationId: true, deletedAt: true, kind: true, threadRootId: true },
  });
  if (!message || message.deletedAt) throw notFound("That message could not be found.");
  if (message.kind === "SYSTEM" || message.threadRootId) throw invalid("This message can't be pinned.");
  const member = await requireMembership(userId, message.conversationId);
  if (member.conversation.type !== "DIRECT" && !isAdminRole(member.role)) {
    throw forbidden("Only admins can pin messages here.");
  }

  const existing = await db.pinnedMessage.findUnique({
    where: { conversationId_messageId: { conversationId: message.conversationId, messageId } },
    select: { id: true },
  });

  let pinned: boolean;
  if (existing) {
    await db.pinnedMessage.delete({ where: { id: existing.id } });
    pinned = false;
  } else {
    await db.$transaction(async (tx) => {
      const current = await tx.pinnedMessage.findMany({
        where: { conversationId: message.conversationId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      const overflow = current.slice(maxPins - 1).map((pin) => pin.id);
      if (overflow.length > 0) await tx.pinnedMessage.deleteMany({ where: { id: { in: overflow } } });
      await tx.pinnedMessage.create({ data: { conversationId: message.conversationId, messageId, pinnedById: userId } });
    });
    pinned = true;
  }

  await publish("message.updated", { conversationId: message.conversationId, messageId }, toConversation(message.conversationId));
  await publish("conversation.updated", { conversationId: message.conversationId }, toConversation(message.conversationId));
  return { pinned };
}

export async function latestPinned(userId: string, conversationId: string) {
  const pins = await db.pinnedMessage.findMany({
    where: {
      conversationId,
      message: { deletedAt: null, hiddenFor: { none: { userId } }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    },
    orderBy: { createdAt: "desc" },
    take: maxPins,
    select: { message: { select: { id: true, body: true, kind: true } } },
  });
  const labels: Record<string, string> = { IMAGE: "Photo", FILE: "File", VOICE: "Voice message", POLL: "Poll" };
  return pins.map((pin) => ({ id: pin.message.id, text: pin.message.body || labels[pin.message.kind] || "Message" }));
}
