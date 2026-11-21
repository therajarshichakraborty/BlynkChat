import "server-only";
import type { MessageKind } from "@/prisma/generated/client";
import type { MessagePage, MessageView } from "@/types/message";
import { db } from "../db";
import { forbidden, invalid, notFound } from "../errors";
import { assertWithinLimit } from "../rate-limit";
import { publish, toConversation, toUsers } from "../realtime/publish";
import { messageInclude, toMessageView } from "../views/messages";
import { blockStatus } from "./blocks";
import { activeMemberIds, isAdminRole, requireMembership, visibleMessagesWhere } from "./conversations";

export const pageSize = 40;
const editWindowMs = 15 * 60 * 1000;
const deleteWindowMs = 60 * 60 * 1000;

export type SendMessageInput = {
  conversationId: string;
  clientId: string;
  body: string;
  replyToId?: string;
  threadRootId?: string;
  attachmentIds?: string[];
  forwarded?: boolean;
};

export type MessageResult = {
  message: MessageView;
  recipients: string[];
};

function historyStart(member: { joinedAt: Date; conversation: { type: string } }) {
  return member.conversation.type === "GROUP" ? member.joinedAt : undefined;
}

export async function listMessages(
  userId: string,
  conversationId: string,
  cursor?: string,
): Promise<MessagePage> {
  const member = await requireMembership(userId, conversationId);
  const start = historyStart(member);
  const rows = await db.message.findMany({
    where: {
      conversationId,
      ...visibleMessagesWhere(userId),
      ...(start ? { createdAt: { gte: start } } : {}),
    },
    include: messageInclude(userId),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > pageSize;
  const page = rows.slice(0, pageSize);
  return {
    messages: page.reverse().map((row) => toMessageView(row, userId)),
    nextCursor: hasMore ? (page[0]?.id ?? null) : null,
  };
}

export async function listThreadReplies(userId: string, rootId: string): Promise<MessageView[]> {
  const root = await db.message.findUnique({ where: { id: rootId }, select: { conversationId: true } });
  if (!root) throw notFound("That thread could not be found.");
  await requireMembership(userId, root.conversationId);
  const rows = await db.message.findMany({
    where: { threadRootId: rootId, hiddenFor: { none: { userId } } },
    include: messageInclude(userId),
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: 200,
  });
  return rows.map((row) => toMessageView(row, userId));
}

export async function getMessageView(userId: string, messageId: string): Promise<MessageView> {
  const row = await db.message.findFirst({
    where: { id: messageId, hiddenFor: { none: { userId } } },
    include: messageInclude(userId),
  });
  if (!row) throw notFound("That message could not be found.");
  await requireMembership(userId, row.conversationId);
  return toMessageView(row, userId);
}

export async function assertCanPost(userId: string, conversationId: string, options: { reacting?: boolean } = {}) {
  const member = await requireMembership(userId, conversationId);
  const { conversation } = member;
  if (!options.reacting && conversation.onlyAdminsCanPost && !isAdminRole(member.role)) {
    throw forbidden("Only admins can send messages here.");
  }
  if (conversation.type === "DIRECT") {
    const peer = await db.conversationMember.findFirst({
      where: { conversationId, userId: { not: userId } },
      select: { userId: true },
    });
    if (peer && (await blockStatus(userId, peer.userId)) !== "none") {
      throw forbidden("You cannot message this person.");
    }
  }
  return member;
}

function kindFor(attachmentKinds: string[]): MessageKind {
  if (attachmentKinds.includes("VOICE")) return "VOICE";
  if (attachmentKinds.includes("IMAGE")) return "IMAGE";
  if (attachmentKinds.length > 0) return "FILE";
  return "TEXT";
}

export async function sendMessage(userId: string, input: SendMessageInput): Promise<MessageResult> {
  const member = await assertCanPost(userId, input.conversationId);
  const recipients = await activeMemberIds(input.conversationId);

  const existing = await db.message.findUnique({
    where: { senderId_clientId: { senderId: userId, clientId: input.clientId } },
    include: messageInclude(userId),
  });
  if (existing) return { message: toMessageView(existing, userId), recipients };
  assertWithinLimit("send", userId);

  if (input.replyToId) {
    const reply = await db.message.findUnique({ where: { id: input.replyToId }, select: { conversationId: true } });
    if (!reply || reply.conversationId !== input.conversationId) throw invalid("You can only reply to messages in this chat.");
  }
  if (input.threadRootId) {
    const root = await db.message.findUnique({
      where: { id: input.threadRootId },
      select: { conversationId: true, threadRootId: true },
    });
    if (!root || root.conversationId !== input.conversationId || root.threadRootId) {
      throw invalid("That thread could not be found.");
    }
  }

  const attachments = input.attachmentIds?.length
    ? await db.attachment.findMany({
        where: { id: { in: input.attachmentIds }, uploaderId: userId, messageId: null },
        select: { id: true, kind: true },
      })
    : [];
  if (attachments.length !== (input.attachmentIds?.length ?? 0)) {
    throw invalid("One of the attachments is no longer available. Upload it again.");
  }
  if (!input.body.trim() && attachments.length === 0) throw invalid("Write a message first.");

  const now = new Date();
  const seconds = member.conversation.disappearingSeconds;
  const created = await db.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        conversationId: input.conversationId,
        senderId: userId,
        clientId: input.clientId,
        kind: kindFor(attachments.map((attachment) => attachment.kind)),
        body: input.body.trim(),
        replyToId: input.replyToId,
        threadRootId: input.threadRootId,
        forwarded: input.forwarded ?? false,
        expiresAt: seconds ? new Date(now.getTime() + seconds * 1000) : null,
        createdAt: now,
      },
      select: { id: true },
    });
    if (attachments.length > 0) {
      await tx.attachment.updateMany({
        where: { id: { in: attachments.map((attachment) => attachment.id) } },
        data: { messageId: message.id },
      });
    }
    if (!input.threadRootId) {
      await tx.conversation.update({ where: { id: input.conversationId }, data: { lastMessageAt: now } });
    }
    await tx.conversationMember.update({
      where: { id: member.id },
      data: { lastReadMessageId: message.id, lastReadAt: now, archivedAt: null },
    });
    await tx.conversationMember.updateMany({
      where: { conversationId: input.conversationId, leftAt: null, archivedAt: { not: null }, mutedUntil: null },
      data: { archivedAt: null },
    });
    return tx.message.findUniqueOrThrow({ where: { id: message.id }, include: messageInclude(userId) });
  });

  await publish(
    "message.created",
    {
      conversationId: input.conversationId,
      messageId: created.id,
      senderId: userId,
      threadRootId: created.threadRootId,
    },
    toConversation(input.conversationId),
  );
  if (created.threadRootId) {
    await publish(
      "message.updated",
      { conversationId: input.conversationId, messageId: created.threadRootId },
      toConversation(input.conversationId),
    );
  }
  return { message: toMessageView(created, userId), recipients };
}

async function ownMessage(userId: string, messageId: string) {
  const message = await db.message.findUnique({
    where: { id: messageId },
    select: { id: true, senderId: true, conversationId: true, createdAt: true, deletedAt: true, kind: true },
  });
  if (!message) throw notFound("That message could not be found.");
  const member = await requireMembership(userId, message.conversationId);
  return { message, member };
}

export async function editMessage(userId: string, messageId: string, body: string): Promise<MessageResult> {
  const { message } = await ownMessage(userId, messageId);
  if (message.senderId !== userId) throw forbidden("You can only edit your own messages.");
  if (message.deletedAt) throw invalid("Deleted messages cannot be edited.");
  if (message.kind === "SYSTEM" || message.kind === "POLL") throw invalid("This message cannot be edited.");
  if (Date.now() - message.createdAt.getTime() > editWindowMs) {
    throw forbidden("Messages can only be edited within 15 minutes.");
  }
  if (!body.trim()) throw invalid("A message cannot be empty.");
  const updated = await db.message.update({
    where: { id: messageId },
    data: { body: body.trim(), editedAt: new Date() },
    include: messageInclude(userId),
  });
  await publish(
    "message.updated",
    { conversationId: message.conversationId, messageId },
    toConversation(message.conversationId),
  );
  return { message: toMessageView(updated, userId), recipients: await activeMemberIds(message.conversationId) };
}

export async function deleteMessageForEveryone(userId: string, messageId: string): Promise<MessageResult> {
  const { message, member } = await ownMessage(userId, messageId);
  if (message.deletedAt) throw invalid("This message was already deleted.");
  const mine = message.senderId === userId;
  const moderator = member.conversation.type !== "DIRECT" && isAdminRole(member.role);
  if (!mine && !moderator) throw forbidden("You can only delete your own messages for everyone.");
  if (mine && !moderator && Date.now() - message.createdAt.getTime() > deleteWindowMs) {
    throw forbidden("Messages can only be deleted for everyone within 1 hour.");
  }
  const updated = await db.$transaction(async (tx) => {
    await tx.reaction.deleteMany({ where: { messageId } });
    await tx.pinnedMessage.deleteMany({ where: { messageId } });
    return tx.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date(), body: "" },
      include: messageInclude(userId),
    });
  });
  await publish(
    "message.deleted",
    { conversationId: message.conversationId, messageId },
    toConversation(message.conversationId),
  );
  return { message: toMessageView(updated, userId), recipients: await activeMemberIds(message.conversationId) };
}

export async function deleteMessageForMe(userId: string, messageId: string) {
  const { message } = await ownMessage(userId, messageId);
  await db.messageHidden.upsert({
    where: { messageId_userId: { messageId, userId } },
    create: { messageId, userId },
    update: {},
  });
  await publish("message.deleted", { conversationId: message.conversationId, messageId }, toUsers([userId]));
  return { messageId, conversationId: message.conversationId };
}

export async function forwardMessage(userId: string, messageId: string, conversationIds: string[]) {
  const source = await db.message.findUnique({
    where: { id: messageId },
    include: { attachments: true },
  });
  if (!source || source.deletedAt) throw notFound("That message could not be found.");
  await requireMembership(userId, source.conversationId);
  if (source.kind === "SYSTEM" || source.kind === "POLL") throw invalid("This message can't be forwarded.");

  const targets = [...new Set(conversationIds)];
  for (const conversationId of targets) await assertCanPost(userId, conversationId);
  assertWithinLimit("send", userId);

  let count = 0;
  for (const conversationId of targets) {
    const target = await db.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      select: { disappearingSeconds: true },
    });
    const now = new Date();
    const created = await db.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          clientId: `fwd-${messageId}-${conversationId}-${now.getTime()}`,
          kind: source.kind,
          body: source.body,
          forwarded: true,
          expiresAt: target.disappearingSeconds ? new Date(now.getTime() + target.disappearingSeconds * 1000) : null,
          createdAt: now,
          attachments: {
            create: source.attachments.map((attachment) => ({
              uploaderId: userId,
              kind: attachment.kind,
              mime: attachment.mime,
              size: attachment.size,
              name: attachment.name,
              path: attachment.path,
              width: attachment.width,
              height: attachment.height,
              durationMs: attachment.durationMs,
              waveform: attachment.waveform ?? undefined,
            })),
          },
        },
        select: { id: true },
      });
      await tx.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } });
      await tx.conversationMember.updateMany({
        where: { conversationId, userId },
        data: { lastReadMessageId: message.id, lastReadAt: now, archivedAt: null },
      });
      return message;
    });
    count += 1;
    await publish(
      "message.created",
      { conversationId, messageId: created.id, senderId: userId, threadRootId: null },
      toConversation(conversationId),
    );
  }
  return { count };
}
