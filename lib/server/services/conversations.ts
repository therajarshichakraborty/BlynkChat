import "server-only";
import type { MemberRole, Prisma } from "@/prisma/generated/client";
import { initialsFor } from "@/lib/utils/initials";
import type {
  ChatFilter,
  ChatKind,
  ChatPreview,
  ChatSummary,
  ConversationView,
  MemberRoleView,
} from "@/types/conversation";
import { db } from "../db";
import { forbidden, notFound } from "../errors";
import { personDetailSelect, personSelect, toPerson, toTone } from "../views/people";
import { blockStatus } from "./blocks";

export function isAdminRole(role: MemberRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function toKind(type: "DIRECT" | "GROUP" | "ROOM"): ChatKind {
  return type.toLowerCase() as ChatKind;
}

export function toRoleView(role: MemberRole): MemberRoleView {
  return role.toLowerCase() as MemberRoleView;
}

export function visibleMessagesWhere(userId: string, now = new Date()): Prisma.MessageWhereInput {
  return {
    threadRootId: null,
    hiddenFor: { none: { userId } },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

export async function requireMembership(userId: string, conversationId: string) {
  const member = await db.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    include: { conversation: true },
  });
  if (!member || member.leftAt) {
    throw notFound("This conversation does not exist or you are no longer a member.");
  }
  return member;
}

export async function requireAdmin(userId: string, conversationId: string) {
  const member = await requireMembership(userId, conversationId);
  if (!isAdminRole(member.role)) throw forbidden("Only admins can do that.");
  return member;
}

export async function activeMemberIds(conversationId: string) {
  const members = await db.conversationMember.findMany({
    where: { conversationId, leftAt: null },
    select: { userId: true },
  });
  return members.map((member) => member.userId);
}

type PreviewRow = {
  kind: string;
  body: string;
  deletedAt: Date | null;
  senderId: string | null;
  sender: { name: string } | null;
};

function toPreview(row: PreviewRow, userId: string, kind: ChatKind): ChatPreview {
  const fromMe = row.senderId === userId;
  const author = kind === "direct" || row.kind === "SYSTEM" ? null : fromMe ? "You" : (row.sender?.name.split(" ")[0] ?? null);
  if (row.deletedAt) return { kind: "deleted", text: "This message was deleted", author: null, fromMe };
  const labels: Record<string, string> = { IMAGE: "Photo", FILE: "File", VOICE: "Voice message", POLL: "Poll" };
  const previewKind = row.kind.toLowerCase() as ChatPreview["kind"];
  return { kind: previewKind, text: row.body || labels[row.kind] || "", author, fromMe };
}

async function unreadCounts(userId: string) {
  const rows = await db.$queryRaw<{ conversationId: string; unread: number }[]>`
    select m."conversationId", count(msg.id)::int as unread
    from conversation_member m
    join message msg on msg."conversationId" = m."conversationId"
    where m."userId" = ${userId}
      and m."leftAt" is null
      and msg."createdAt" > coalesce(m."lastReadAt", m."joinedAt")
      and msg."senderId" is distinct from ${userId}
      and msg."kind" <> 'SYSTEM'
      and msg."deletedAt" is null
      and msg."threadRootId" is null
      and (msg."expiresAt" is null or msg."expiresAt" > now())
      and not exists (select 1 from message_hidden h where h."messageId" = msg.id and h."userId" = ${userId})
    group by m."conversationId"`;
  return new Map(rows.map((row) => [row.conversationId, row.unread]));
}

export async function totalUnread(userId: string) {
  const [counts, muted] = await Promise.all([
    unreadCounts(userId),
    db.conversationMember.findMany({
      where: { userId, leftAt: null, OR: [{ mutedUntil: { gt: new Date() } }, { archivedAt: { not: null } }] },
      select: { conversationId: true },
    }),
  ]);
  const skip = new Set(muted.map((member) => member.conversationId));
  let total = 0;
  for (const [id, count] of counts) if (!skip.has(id)) total += count;
  return total;
}

type ListOptions = {
  filter: ChatFilter;
  query: string;
  isOnline?: (userId: string) => boolean;
};

export async function listConversations(userId: string, options: ListOptions): Promise<ChatSummary[]> {
  const { filter, query } = options;
  const needle = query.trim();
  const now = new Date();
  const typeFilter = filter === "groups" ? "GROUP" : filter === "rooms" ? "ROOM" : undefined;

  const memberships = await db.conversationMember.findMany({
    where: {
      userId,
      leftAt: null,
      archivedAt: filter === "archived" ? { not: null } : null,
      conversation: {
        type: typeFilter,
        ...(needle
          ? {
              OR: [
                { title: { contains: needle, mode: "insensitive" } },
                {
                  type: "DIRECT",
                  members: {
                    some: {
                      userId: { not: userId },
                      user: {
                        OR: [
                          { name: { contains: needle, mode: "insensitive" } },
                          { username: { contains: needle, mode: "insensitive" } },
                        ],
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },
    },
    include: {
      conversation: {
        include: {
          community: { select: { slug: true } },
          members: {
            where: { leftAt: null, userId: { not: userId } },
            take: 1,
            select: { user: { select: personSelect } },
          },
          _count: { select: { members: { where: { leftAt: null } } } },
          messages: {
            where: visibleMessagesWhere(userId, now),
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 1,
            select: { kind: true, body: true, deletedAt: true, senderId: true, sender: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: [{ pinnedAt: { sort: "desc", nulls: "last" } }, { conversation: { lastMessageAt: "desc" } }],
  });

  const counts = await unreadCounts(userId);

  const summaries = memberships.map((membership): ChatSummary => {
    const conversation = membership.conversation;
    const kind = toKind(conversation.type);
    const peer = kind === "direct" ? conversation.members[0]?.user : undefined;
    const title = peer?.name ?? conversation.title ?? "Untitled";
    const last = conversation.messages[0];
    const href =
      kind === "room" && conversation.community && conversation.slug
        ? `/communities/${conversation.community.slug}/${conversation.slug}`
        : `/chats/${conversation.id}`;
    return {
      id: conversation.id,
      kind,
      title,
      initials: initialsFor(title),
      tone: toTone(peer?.tone ?? conversation.tone),
      image: peer?.image ?? conversation.image,
      href,
      peerId: peer?.id ?? null,
      memberCount: conversation._count.members,
      pinned: membership.pinnedAt !== null,
      muted: membership.mutedUntil !== null && membership.mutedUntil > now,
      archived: membership.archivedAt !== null,
      unread: counts.get(conversation.id) ?? 0,
      lastActivityAt: conversation.lastMessageAt.toISOString(),
      preview: last ? toPreview(last, userId, kind) : null,
      online: peer ? (options.isOnline?.(peer.id) ?? false) : false,
    };
  });

  return filter === "unread" ? summaries.filter((summary) => summary.unread > 0) : summaries;
}

export async function getConversationView(userId: string, conversationId: string): Promise<ConversationView> {
  const membership = await requireMembership(userId, conversationId);
  const conversation = await db.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    include: {
      community: { select: { slug: true, name: true } },
      members: {
        where: { leftAt: null },
        select: {
          userId: true,
          lastReadAt: true,
          lastDeliveredAt: true,
          user: {
            select: {
              ...personDetailSelect,
              lastSeenAt: true,
              settings: { select: { readReceipts: true, lastSeenVisibility: true } },
            },
          },
        },
      },
    },
  });
  const me = await db.userSettings.findUnique({ where: { userId }, select: { readReceipts: true } });
  const kind = toKind(conversation.type);
  const others = conversation.members.filter((member) => member.userId !== userId);
  const peerMember = kind === "direct" ? others[0] : undefined;
  const blocked = peerMember ? await blockStatus(userId, peerMember.userId) : "none";
  const receiptsEnabled = (me?.readReceipts ?? true) && blocked === "none";
  const admin = isAdminRole(membership.role);
  const title = peerMember?.user.name ?? conversation.title ?? "Untitled";
  const lastSeenHidden = peerMember?.user.settings?.lastSeenVisibility === "NOBODY" || blocked !== "none";

  return {
    id: conversation.id,
    kind,
    title,
    description: conversation.description,
    initials: initialsFor(title),
    tone: toTone(peerMember?.user.tone ?? conversation.tone),
    image: peerMember?.user.image ?? conversation.image,
    peer: peerMember ? toPerson(peerMember.user) : null,
    presence: peerMember
      ? {
          online: false,
          lastSeenAt: lastSeenHidden ? null : (peerMember.user.lastSeenAt?.toISOString() ?? null),
        }
      : null,
    memberCount: conversation.members.length,
    myRole: toRoleView(membership.role),
    canPost: blocked === "none" && (!conversation.onlyAdminsCanPost || admin),
    blocked,
    muted: membership.mutedUntil !== null && membership.mutedUntil > new Date(),
    pinned: membership.pinnedAt !== null,
    archived: membership.archivedAt !== null,
    onlyAdminsCanPost: conversation.onlyAdminsCanPost,
    requireApproval: conversation.requireApproval,
    disappearingSeconds: conversation.disappearingSeconds,
    inviteCode: admin && kind === "group" ? conversation.inviteCode : null,
    receiptsEnabled,
    receipts: receiptsEnabled
      ? others
          .filter((member) => member.user.settings?.readReceipts ?? true)
          .map((member) => ({
            userId: member.userId,
            lastReadAt: member.lastReadAt?.toISOString() ?? null,
            lastDeliveredAt: member.lastDeliveredAt?.toISOString() ?? null,
          }))
      : [],
    lastReadAt: membership.lastReadAt?.toISOString() ?? null,
    community: conversation.community,
  };
}

export function directKeyFor(a: string, b: string) {
  return [a, b].sort().join(":");
}

export async function getOrCreateDirect(userId: string, otherId: string) {
  if (userId === otherId) throw forbidden("You cannot start a chat with yourself.");
  const other = await db.user.findUnique({ where: { id: otherId }, select: { id: true } });
  if (!other) throw notFound("That person could not be found.");
  if ((await blockStatus(userId, otherId)) !== "none") throw forbidden("You cannot message this person.");

  const directKey = directKeyFor(userId, otherId);
  const existing = await db.conversation.findUnique({ where: { directKey }, select: { id: true } });
  if (existing) {
    await db.conversationMember.updateMany({
      where: { conversationId: existing.id, userId },
      data: { archivedAt: null, leftAt: null },
    });
    return existing.id;
  }

  const created = await db.conversation.create({
    data: {
      type: "DIRECT",
      directKey,
      createdById: userId,
      members: { create: [{ userId }, { userId: otherId }] },
    },
    select: { id: true },
  });
  return created.id;
}
