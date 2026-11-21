import "server-only";
import { randomBytes } from "node:crypto";
import type { MemberRole, Prisma, Tone } from "@/prisma/generated/client";
import { firstName } from "@/lib/utils/messages";
import type { InvitePreview } from "@/types/conversation";
import { db } from "../db";
import { forbidden, invalid, notFound } from "../errors";
import { publish, toConversation, toUsers } from "../realtime/publish";
import { blockedUserIds } from "./blocks";
import { requireAdmin, requireMembership } from "./conversations";

const tones: Tone[] = ["BLUE", "SKY", "INDIGO", "VIOLET", "PURPLE", "PINK", "ORANGE", "AMBER", "TEAL", "EMERALD", "CYAN"];

type Tx = Prisma.TransactionClient;

export type CreateGroupInput = {
  name: string;
  description: string;
  memberIds: string[];
  requireApproval: boolean;
  onlyAdminsCanPost: boolean;
  disappearingSeconds: number | null;
  image: string | null;
};

function toneFor(seed: string) {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tones[hash % tones.length] ?? "BLUE";
}

export function newInviteCode() {
  return randomBytes(12).toString("base64url");
}

async function names(tx: Tx, userIds: string[]) {
  const users = await tx.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } });
  const byId = new Map(users.map((user) => [user.id, firstName(user.name)]));
  return userIds.map((id) => byId.get(id) ?? "Someone");
}

function joinNames(list: string[]) {
  if (list.length <= 1) return list[0] ?? "";
  return `${list.slice(0, -1).join(", ")} and ${list.at(-1)}`;
}

export async function addSystemMessage(tx: Tx, conversationId: string, actorId: string | null, body: string, data: Prisma.InputJsonValue) {
  const now = new Date();
  const message = await tx.message.create({
    data: {
      conversationId,
      senderId: actorId,
      clientId: `system-${now.getTime()}-${randomBytes(4).toString("hex")}`,
      kind: "SYSTEM",
      body,
      systemData: data,
      createdAt: now,
    },
    select: { id: true },
  });
  await tx.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: now } });
  return message.id;
}

export async function announce(conversationId: string, messageIds: string[], extraUsers: string[] = []) {
  for (const messageId of messageIds) {
    await publish("message.created", { conversationId, messageId, senderId: null, threadRootId: null }, toConversation(conversationId));
  }
  await publish("member.changed", { conversationId, userId: "" }, toConversation(conversationId));
  if (extraUsers.length > 0) await publish("member.changed", { conversationId, userId: "" }, toUsers(extraUsers));
}

async function addableUsers(userId: string, candidateIds: string[]) {
  const blocked = await blockedUserIds(userId);
  const ids = [...new Set(candidateIds)].filter((id) => id !== userId && !blocked.has(id));
  if (ids.length === 0) return [];
  const users = await db.user.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      settings: { select: { approveGroupInvites: true } },
      memberships: {
        where: { leftAt: null, conversation: { type: "DIRECT", members: { some: { userId, leftAt: null } } } },
        select: { id: true },
        take: 1,
      },
    },
  });
  return users.filter((user) => !user.settings?.approveGroupInvites || user.memberships.length > 0).map((user) => user.id);
}

export async function createGroup(userId: string, input: CreateGroupInput) {
  const memberIds = await addableUsers(userId, input.memberIds);
  if (memberIds.length === 0) throw invalid("Add at least one person who can be added to groups.", { members: "Add at least one member." });

  const { conversationId, messageIds } = await db.$transaction(async (tx) => {
    const now = new Date();
    const conversation = await tx.conversation.create({
      data: {
        type: "GROUP",
        title: input.name,
        description: input.description,
        image: input.image,
        tone: toneFor(input.name),
        requireApproval: input.requireApproval,
        onlyAdminsCanPost: input.onlyAdminsCanPost,
        disappearingSeconds: input.disappearingSeconds,
        inviteCode: newInviteCode(),
        createdById: userId,
        lastMessageAt: now,
        members: {
          create: [
            { userId, role: "OWNER", joinedAt: now, lastReadAt: now },
            ...memberIds.map((id) => ({ userId: id, role: "MEMBER" as MemberRole, joinedAt: now })),
          ],
        },
      },
      select: { id: true },
    });
    const [actor = "Someone"] = await names(tx, [userId]);
    const added = await names(tx, memberIds);
    const created = await addSystemMessage(tx, conversation.id, userId, `${actor} created the group “${input.name}”`, {
      type: "group.created",
    });
    const addedMessage = await addSystemMessage(tx, conversation.id, userId, `${actor} added ${joinNames(added)}`, {
      type: "member.added",
      userIds: memberIds,
    });
    await tx.conversationMember.updateMany({
      where: { conversationId: conversation.id, userId },
      data: { lastReadMessageId: addedMessage, lastReadAt: new Date() },
    });
    return { conversationId: conversation.id, messageIds: [created, addedMessage] };
  });

  await announce(conversationId, messageIds, [userId, ...memberIds]);
  return { id: conversationId };
}

async function requireGroupAdmin(userId: string, conversationId: string) {
  const member = await requireAdmin(userId, conversationId);
  if (member.conversation.type !== "GROUP") throw forbidden("That only works in groups.");
  return member;
}

export async function addMembers(userId: string, conversationId: string, candidateIds: string[]) {
  await requireGroupAdmin(userId, conversationId);
  const ids = await addableUsers(userId, candidateIds);
  const existing = await db.conversationMember.findMany({
    where: { conversationId, userId: { in: ids } },
    select: { userId: true, leftAt: true },
  });
  const active = new Set(existing.filter((member) => !member.leftAt).map((member) => member.userId));
  const toAdd = ids.filter((id) => !active.has(id));
  if (toAdd.length === 0) throw invalid("Those people are already in the group or can't be added.");

  const messageId = await db.$transaction(async (tx) => {
    const now = new Date();
    for (const id of toAdd) {
      await tx.conversationMember.upsert({
        where: { conversationId_userId: { conversationId, userId: id } },
        create: { conversationId, userId: id, joinedAt: now },
        update: { leftAt: null, joinedAt: now, role: "MEMBER", archivedAt: null, lastReadAt: null, lastReadMessageId: null },
      });
    }
    await tx.joinRequest.updateMany({
      where: { conversationId, userId: { in: toAdd }, status: "PENDING" },
      data: { status: "APPROVED", decidedById: userId },
    });
    const [actor = "Someone"] = await names(tx, [userId]);
    return addSystemMessage(tx, conversationId, userId, `${actor} added ${joinNames(await names(tx, toAdd))}`, {
      type: "member.added",
      userIds: toAdd,
    });
  });
  await announce(conversationId, [messageId], toAdd);
  return { added: toAdd.length };
}

export async function removeMember(userId: string, conversationId: string, targetId: string) {
  const actor = await requireGroupAdmin(userId, conversationId);
  if (targetId === userId) throw invalid("Use Leave group to leave.");
  const target = await requireMembership(targetId, conversationId).catch(() => {
    throw notFound("That person isn't in this group.");
  });
  if (target.role === "OWNER") throw forbidden("The owner can't be removed.");
  if (target.role === "ADMIN" && actor.role !== "OWNER") throw forbidden("Only the owner can remove an admin.");

  const messageId = await db.$transaction(async (tx) => {
    await tx.conversationMember.update({ where: { id: target.id }, data: { leftAt: new Date(), role: "MEMBER", pinnedAt: null } });
    const [actorName = "Someone", targetName = "someone"] = await names(tx, [userId, targetId]);
    return addSystemMessage(tx, conversationId, userId, `${actorName} removed ${targetName}`, {
      type: "member.removed",
      userId: targetId,
    });
  });
  await announce(conversationId, [messageId], [targetId]);
}

export async function setMemberRole(userId: string, conversationId: string, targetId: string, role: "ADMIN" | "MEMBER") {
  const actor = await requireGroupAdmin(userId, conversationId);
  const target = await requireMembership(targetId, conversationId).catch(() => {
    throw notFound("That person isn't in this group.");
  });
  if (target.role === "OWNER") throw forbidden("The owner's role can't be changed.");
  if (target.role === role) return;
  if (role === "MEMBER" && target.userId !== userId && actor.role !== "OWNER" && target.role === "ADMIN") {
    throw forbidden("Only the owner can dismiss other admins.");
  }

  const messageId = await db.$transaction(async (tx) => {
    await tx.conversationMember.update({ where: { id: target.id }, data: { role } });
    const [actorName = "Someone", targetName = "someone"] = await names(tx, [userId, targetId]);
    const body = role === "ADMIN" ? `${actorName} made ${targetName} an admin` : `${actorName} dismissed ${targetName} as admin`;
    return addSystemMessage(tx, conversationId, userId, body, { type: "member.role", userId: targetId, role });
  });
  await announce(conversationId, [messageId]);
}

export async function transferOwnership(userId: string, conversationId: string, targetId: string) {
  const actor = await requireGroupAdmin(userId, conversationId);
  if (actor.role !== "OWNER") throw forbidden("Only the owner can transfer ownership.");
  if (targetId === userId) throw invalid("You already own this group.");
  const target = await requireMembership(targetId, conversationId).catch(() => {
    throw notFound("That person isn't in this group.");
  });

  const messageId = await db.$transaction(async (tx) => {
    await tx.conversationMember.update({ where: { id: actor.id }, data: { role: "ADMIN" } });
    await tx.conversationMember.update({ where: { id: target.id }, data: { role: "OWNER" } });
    const [actorName = "Someone", targetName = "someone"] = await names(tx, [userId, targetId]);
    return addSystemMessage(tx, conversationId, userId, `${actorName} made ${targetName} the group owner`, {
      type: "owner.transferred",
      userId: targetId,
    });
  });
  await announce(conversationId, [messageId]);
}

export async function leaveGroup(userId: string, conversationId: string) {
  const member = await requireMembership(userId, conversationId);
  if (member.conversation.type !== "GROUP") throw forbidden("You can only leave groups.");

  const messageIds = await db.$transaction(async (tx) => {
    const ids: string[] = [];
    await tx.conversationMember.update({
      where: { id: member.id },
      data: { leftAt: new Date(), role: "MEMBER", pinnedAt: null },
    });
    const [actorName = "Someone"] = await names(tx, [userId]);
    ids.push(await addSystemMessage(tx, conversationId, userId, `${actorName} left`, { type: "member.left", userId }));
    if (member.role === "OWNER") {
      const successor = await tx.conversationMember.findFirst({
        where: { conversationId, leftAt: null },
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        select: { id: true, userId: true },
      });
      if (successor) {
        await tx.conversationMember.update({ where: { id: successor.id }, data: { role: "OWNER" } });
        const [successorName = "Someone"] = await names(tx, [successor.userId]);
        ids.push(
          await addSystemMessage(tx, conversationId, null, `${successorName} is now the group owner`, {
            type: "owner.transferred",
            userId: successor.userId,
          }),
        );
      }
    }
    return ids;
  });
  await announce(conversationId, messageIds, [userId]);
}

export async function rotateInvite(userId: string, conversationId: string) {
  await requireGroupAdmin(userId, conversationId);
  const inviteCode = newInviteCode();
  await db.conversation.update({ where: { id: conversationId }, data: { inviteCode } });
  return { inviteCode };
}

export async function getInvitePreview(userId: string, code: string): Promise<InvitePreview | null> {
  const conversation = await db.conversation.findUnique({
    where: { inviteCode: code },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      tone: true,
      image: true,
      requireApproval: true,
      _count: { select: { members: { where: { leftAt: null } } } },
      members: { where: { userId }, select: { leftAt: true } },
      joinRequests: { where: { userId, status: "PENDING" }, select: { id: true } },
    },
  });
  if (!conversation || conversation.type !== "GROUP") return null;
  const membership = conversation.members[0];
  return {
    conversationId: conversation.id,
    title: conversation.title ?? "Group",
    description: conversation.description,
    tone: conversation.tone.toLowerCase() as InvitePreview["tone"],
    image: conversation.image,
    memberCount: conversation._count.members,
    requireApproval: conversation.requireApproval,
    status: membership && !membership.leftAt ? "member" : conversation.joinRequests.length > 0 ? "pending" : "none",
  };
}

export async function joinByInvite(userId: string, code: string) {
  const conversation = await db.conversation.findUnique({
    where: { inviteCode: code },
    select: { id: true, type: true, requireApproval: true, members: { where: { userId }, select: { leftAt: true } } },
  });
  if (!conversation || conversation.type !== "GROUP") throw notFound("This invite link is invalid or was reset.");
  const membership = conversation.members[0];
  if (membership && !membership.leftAt) return { status: "member" as const, conversationId: conversation.id };

  const admins = await db.conversationMember.findMany({
    where: { conversationId: conversation.id, leftAt: null, role: { in: ["OWNER", "ADMIN"] } },
    select: { userId: true },
  });
  const blocked = await blockedUserIds(userId);
  if (admins.some((admin) => blocked.has(admin.userId))) throw forbidden("You can't join this group.");

  if (conversation.requireApproval) {
    await db.joinRequest.upsert({
      where: { conversationId_userId: { conversationId: conversation.id, userId } },
      create: { conversationId: conversation.id, userId },
      update: { status: "PENDING", decidedById: null },
    });
    await publish(
      "conversation.updated",
      { conversationId: conversation.id },
      toUsers(admins.map((admin) => admin.userId)),
    );
    return { status: "pending" as const, conversationId: conversation.id };
  }

  const messageId = await db.$transaction(async (tx) => {
    const now = new Date();
    await tx.conversationMember.upsert({
      where: { conversationId_userId: { conversationId: conversation.id, userId } },
      create: { conversationId: conversation.id, userId, joinedAt: now },
      update: { leftAt: null, joinedAt: now, role: "MEMBER", lastReadAt: null, lastReadMessageId: null },
    });
    const [actorName = "Someone"] = await names(tx, [userId]);
    return addSystemMessage(tx, conversation.id, userId, `${actorName} joined using the invite link`, {
      type: "member.joined",
      userId,
    });
  });
  await announce(conversation.id, [messageId], [userId]);
  return { status: "member" as const, conversationId: conversation.id };
}
