import "server-only";
import type { JoinRequestView } from "@/types/conversation";
import { firstName } from "@/lib/utils/messages";
import { db } from "../db";
import { forbidden, invalid, notFound } from "../errors";
import { publish, toConversation, toUsers } from "../realtime/publish";
import { removeFile } from "../storage";
import { personDetailSelect, toPerson } from "../views/people";
import { requireAdmin } from "./conversations";
import { addSystemMessage, announce } from "./groups";

export type GroupSettingsInput = {
  title?: string;
  description?: string;
  image?: string | null;
  onlyAdminsCanPost?: boolean;
  requireApproval?: boolean;
  disappearingSeconds?: number | null;
};

function disappearingLabel(seconds: number) {
  return seconds >= 7 * 24 * 60 * 60 ? "7 days" : "24 hours";
}

export async function updateGroupSettings(userId: string, conversationId: string, input: GroupSettingsInput) {
  const member = await requireAdmin(userId, conversationId);
  const current = member.conversation;
  if (current.type !== "GROUP") throw forbidden("That only works in groups.");

  const messageIds = await db.$transaction(async (tx) => {
    const actor = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } });
    const name = firstName(actor.name);
    const ids: string[] = [];
    const data: GroupSettingsInput = {};

    if (input.title !== undefined && input.title !== current.title) {
      data.title = input.title;
      ids.push(await addSystemMessage(tx, conversationId, userId, `${name} changed the group name to “${input.title}”`, { type: "group.title" }));
    }
    if (input.description !== undefined && input.description !== current.description) {
      data.description = input.description;
      ids.push(await addSystemMessage(tx, conversationId, userId, `${name} changed the group description`, { type: "group.description" }));
    }
    if (input.image !== undefined && input.image !== current.image) {
      data.image = input.image;
      const body = input.image ? `${name} changed the group icon` : `${name} removed the group icon`;
      ids.push(await addSystemMessage(tx, conversationId, userId, body, { type: "group.image" }));
    }
    if (input.onlyAdminsCanPost !== undefined && input.onlyAdminsCanPost !== current.onlyAdminsCanPost) {
      data.onlyAdminsCanPost = input.onlyAdminsCanPost;
      const body = input.onlyAdminsCanPost
        ? `${name} changed this group so only admins can send messages`
        : `${name} changed this group so all members can send messages`;
      ids.push(await addSystemMessage(tx, conversationId, userId, body, { type: "group.posting" }));
    }
    if (input.requireApproval !== undefined && input.requireApproval !== current.requireApproval) {
      data.requireApproval = input.requireApproval;
      const body = input.requireApproval
        ? `${name} turned on admin approval to join this group`
        : `${name} turned off admin approval to join this group`;
      ids.push(await addSystemMessage(tx, conversationId, userId, body, { type: "group.approval" }));
    }
    if (input.disappearingSeconds !== undefined && input.disappearingSeconds !== current.disappearingSeconds) {
      data.disappearingSeconds = input.disappearingSeconds;
      const body = input.disappearingSeconds
        ? `${name} turned on disappearing messages. New messages will disappear after ${disappearingLabel(input.disappearingSeconds)}.`
        : `${name} turned off disappearing messages`;
      ids.push(await addSystemMessage(tx, conversationId, userId, body, { type: "group.disappearing" }));
    }

    if (Object.keys(data).length > 0) {
      await tx.conversation.update({ where: { id: conversationId }, data });
    }
    if (data.requireApproval === false) {
      await tx.joinRequest.updateMany({ where: { conversationId, status: "PENDING" }, data: { status: "REJECTED" } });
    }
    return ids;
  });

  if (messageIds.length > 0) {
    await announce(conversationId, messageIds);
    await publish("conversation.updated", { conversationId }, toConversation(conversationId));
  }
  return { changed: messageIds.length };
}

export async function listJoinRequests(userId: string, conversationId: string): Promise<JoinRequestView[]> {
  const member = await requireAdmin(userId, conversationId).catch(() => null);
  if (!member || member.conversation.type !== "GROUP") return [];
  const requests = await db.joinRequest.findMany({
    where: { conversationId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { user: { select: personDetailSelect } },
  });
  return requests.map((request) => ({
    id: request.id,
    person: toPerson(request.user),
    createdAt: request.createdAt.toISOString(),
  }));
}

export async function decideJoinRequest(userId: string, requestId: string, approve: boolean) {
  const request = await db.joinRequest.findUnique({ where: { id: requestId } });
  if (!request || request.status !== "PENDING") throw notFound("That request was already handled.");
  await requireAdmin(userId, request.conversationId);

  if (!approve) {
    await db.joinRequest.update({ where: { id: requestId }, data: { status: "REJECTED", decidedById: userId } });
    await publish("conversation.updated", { conversationId: request.conversationId }, toUsers([request.userId, userId]));
    return { approved: false };
  }

  const blocked = await db.block.count({
    where: {
      OR: [
        { blockerId: request.userId, blockedId: userId },
        { blockerId: userId, blockedId: request.userId },
      ],
    },
  });
  if (blocked > 0) throw invalid("You can't add this person.");

  const messageId = await db.$transaction(async (tx) => {
    const now = new Date();
    await tx.joinRequest.update({ where: { id: requestId }, data: { status: "APPROVED", decidedById: userId } });
    await tx.conversationMember.upsert({
      where: { conversationId_userId: { conversationId: request.conversationId, userId: request.userId } },
      create: { conversationId: request.conversationId, userId: request.userId, joinedAt: now },
      update: { leftAt: null, joinedAt: now, role: "MEMBER", lastReadAt: null, lastReadMessageId: null },
    });
    const people = await tx.user.findMany({ where: { id: { in: [userId, request.userId] } }, select: { id: true, name: true } });
    const nameOf = (id: string) => firstName(people.find((person) => person.id === id)?.name ?? "Someone");
    return addSystemMessage(
      tx,
      request.conversationId,
      userId,
      `${nameOf(userId)} approved ${nameOf(request.userId)}’s request to join`,
      { type: "member.approved", userId: request.userId },
    );
  });
  await announce(request.conversationId, [messageId], [request.userId]);
  return { approved: true };
}

const globalForPurge = globalThis as typeof globalThis & { relayLastPurge?: number };

export async function purgeExpiredMessages() {
  const now = Date.now();
  if (globalForPurge.relayLastPurge && now - globalForPurge.relayLastPurge < 60_000) return;
  globalForPurge.relayLastPurge = now;

  const expired = await db.message.findMany({
    where: { expiresAt: { lt: new Date(now) } },
    select: { id: true, conversationId: true, attachments: { select: { path: true } } },
    take: 500,
  });
  if (expired.length === 0) return;
  const paths = expired.flatMap((message) => message.attachments.map((attachment) => attachment.path));
  await db.message.deleteMany({ where: { id: { in: expired.map((message) => message.id) } } });
  const stillUsed = new Set(
    (await db.attachment.findMany({ where: { path: { in: paths } }, select: { path: true } })).map((row) => row.path),
  );
  for (const path of paths) if (!stillUsed.has(path)) await removeFile(path);
  for (const conversationId of new Set(expired.map((message) => message.conversationId))) {
    await publish("conversation.updated", { conversationId }, toConversation(conversationId));
  }
}
