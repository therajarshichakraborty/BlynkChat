import "server-only";
import type { CommunityCategory, Prisma } from "@/prisma/generated/client";
import { initialsFor } from "@/lib/utils/initials";
import { firstName } from "@/lib/utils/messages";
import type {
  CategoryView,
  CommunityRoomPage,
  CommunitySummary,
  RoomIconView,
  RoomSummary,
} from "@/types/community";
import type { MemberView } from "@/types/conversation";
import { db } from "../db";
import { forbidden, invalid, notFound } from "../errors";
import { isOnline } from "../realtime/presence";
import { publish, toUsers } from "../realtime/publish";
import { personDetailSelect, toPerson, toTone } from "../views/people";
import { getConversationView } from "./conversations";
import { newInviteCode } from "./groups";

const sampleSize = 3;

const summaryInclude = () =>
  ({
    members: {
      take: sampleSize,
      orderBy: { joinedAt: "asc" },
      select: { user: { select: { name: true, tone: true } } },
    },
    _count: { select: { members: true } },
    rooms: {
      orderBy: { lastMessageAt: "desc" },
      take: 1,
      select: {
        title: true,
        createdAt: true,
        messages: {
          where: { deletedAt: null, threadRootId: null, kind: { not: "SYSTEM" } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { sender: { select: { name: true } } },
        },
      },
    },
  }) satisfies Prisma.CommunityInclude;

type SummaryRow = Prisma.CommunityGetPayload<{ include: ReturnType<typeof summaryInclude> }>;

function toCategory(category: CommunityCategory): CategoryView {
  return category.toLowerCase() as CategoryView;
}

function activityFor(row: SummaryRow) {
  const room = row.rooms[0];
  const poster = room?.messages[0]?.sender?.name;
  if (room && poster) return `${firstName(poster)} posted in #${room.title}`;
  return `${row._count.members.toLocaleString("en-US")} members`;
}

function toSummary(row: SummaryRow, joined: boolean, unread: number): CommunitySummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    initials: initialsFor(row.name),
    tone: toTone(row.tone),
    image: row.image,
    description: row.description,
    memberCount: row._count.members,
    verified: row.verified,
    joined,
    category: toCategory(row.category),
    visibility: row.visibility === "PUBLIC" ? "public" : "private",
    memberSample: row.members.map((member) => ({
      initials: initialsFor(member.user.name),
      tone: toTone(member.user.tone),
    })),
    activity: activityFor(row),
    unread,
  };
}

async function roomUnread(userId: string) {
  const rows = await db.$queryRaw<{ conversationId: string; communityId: string; unread: number }[]>`
    select m."conversationId", c."communityId", count(msg.id)::int as unread
    from conversation_member m
    join conversation c on c.id = m."conversationId"
    join message msg on msg."conversationId" = m."conversationId"
    where m."userId" = ${userId}
      and m."leftAt" is null
      and c.type = 'ROOM'
      and msg."createdAt" > coalesce(m."lastReadAt", m."joinedAt")
      and msg."senderId" is distinct from ${userId}
      and msg."kind" <> 'SYSTEM'
      and msg."deletedAt" is null
      and msg."threadRootId" is null
      and (m."mutedUntil" is null or m."mutedUntil" < now())
    group by m."conversationId", c."communityId"`;
  const byRoom = new Map(rows.map((row) => [row.conversationId, row.unread]));
  const byCommunity = new Map<string, number>();
  for (const row of rows) byCommunity.set(row.communityId, (byCommunity.get(row.communityId) ?? 0) + row.unread);
  return { byRoom, byCommunity };
}

export async function listJoinedCommunities(userId: string): Promise<CommunitySummary[]> {
  const [rows, unread] = await Promise.all([
    db.community.findMany({
      where: { members: { some: { userId } } },
      include: summaryInclude(),
      orderBy: { name: "asc" },
    }),
    roomUnread(userId),
  ]);
  return rows.map((row) => toSummary(row, true, unread.byCommunity.get(row.id) ?? 0));
}

export async function searchCommunities(
  userId: string,
  category: CategoryView | "for-you",
  query: string,
): Promise<CommunitySummary[]> {
  const needle = query.trim();
  const rows = await db.community.findMany({
    where: {
      OR: [{ visibility: "PUBLIC" }, { members: { some: { userId } } }],
      ...(category === "for-you" ? {} : { category: category.toUpperCase() as CommunityCategory }),
      ...(needle
        ? {
            AND: [
              {
                OR: [
                  { name: { contains: needle, mode: "insensitive" } },
                  { description: { contains: needle, mode: "insensitive" } },
                ],
              },
            ],
          }
        : {}),
    },
    include: summaryInclude(),
    orderBy: [{ members: { _count: "desc" } }, { name: "asc" }],
    take: 60,
  });
  const joined = new Set(
    (
      await db.communityMember.findMany({
        where: { userId, communityId: { in: rows.map((row) => row.id) } },
        select: { communityId: true },
      })
    ).map((row) => row.communityId),
  );
  return rows.map((row) => toSummary(row, joined.has(row.id), 0));
}

export async function featuredCommunities(userId: string): Promise<CommunitySummary[]> {
  const rows = await db.community.findMany({
    where: { visibility: "PUBLIC", members: { none: { userId } } },
    include: summaryInclude(),
    orderBy: [{ members: { _count: "desc" } }],
    take: 3,
  });
  return rows.map((row) => ({ ...toSummary(row, false, 0), highlight: activityFor(row) }));
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "community"
  );
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    if (!(await db.community.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export type CreateCommunityInput = {
  name: string;
  description: string;
  category: CategoryView;
  visibility: "public" | "private";
};

export async function createCommunity(userId: string, input: CreateCommunityInput) {
  const slug = await uniqueSlug(input.name);
  const tones = ["BLUE", "VIOLET", "TEAL", "ORANGE", "CYAN", "PINK", "INDIGO"] as const;
  const tone = tones[input.name.length % tones.length] ?? "BLUE";
  const community = await db.$transaction(async (tx) => {
    const now = new Date();
    const created = await tx.community.create({
      data: {
        slug,
        name: input.name,
        description: input.description,
        category: input.category.toUpperCase() as CommunityCategory,
        visibility: input.visibility === "public" ? "PUBLIC" : "PRIVATE",
        tone,
        cover: tone,
        createdById: userId,
        members: { create: { userId, role: "OWNER", joinedAt: now } },
      },
    });
    const rooms = [
      { slug: "announcements", title: "announcements", icon: "MEGAPHONE" as const, topic: "Updates from the admins", adminsOnly: true },
      { slug: "general", title: "general", icon: "HASH" as const, topic: `Say hello to the ${input.name} community`, adminsOnly: false },
    ];
    for (const room of rooms) {
      await tx.conversation.create({
        data: {
          type: "ROOM",
          title: room.title,
          slug: room.slug,
          roomIcon: room.icon,
          description: room.topic,
          tone,
          communityId: created.id,
          onlyAdminsCanPost: room.adminsOnly,
          inviteCode: newInviteCode(),
          createdById: userId,
          lastMessageAt: now,
          members: { create: { userId, role: "OWNER", joinedAt: now } },
        },
      });
    }
    return created;
  });
  await publish("member.changed", { conversationId: "", userId }, toUsers([userId]));
  return { slug: community.slug };
}

export async function joinCommunity(userId: string, communityId: string) {
  const community = await db.community.findUnique({
    where: { id: communityId },
    select: { id: true, visibility: true, rooms: { select: { id: true } } },
  });
  if (!community) throw notFound("That community could not be found.");
  const existing = await db.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
    select: { id: true },
  });
  if (existing) return { joined: true };
  if (community.visibility !== "PUBLIC") throw forbidden("This community is private. Ask an admin to add you.");

  await db.$transaction(async (tx) => {
    const now = new Date();
    await tx.communityMember.create({ data: { communityId, userId, joinedAt: now } });
    for (const room of community.rooms) {
      await tx.conversationMember.upsert({
        where: { conversationId_userId: { conversationId: room.id, userId } },
        create: { conversationId: room.id, userId, joinedAt: now },
        update: { leftAt: null, joinedAt: now, role: "MEMBER", lastReadAt: now },
      });
    }
  });
  await publish("member.changed", { conversationId: "", userId }, toUsers([userId]));
  return { joined: true };
}

export async function leaveCommunity(userId: string, communityId: string) {
  const member = await db.communityMember.findUnique({
    where: { communityId_userId: { communityId, userId } },
    select: { id: true, role: true },
  });
  if (!member) return { joined: false };
  if (member.role === "OWNER") throw invalid("Owners can't leave their community.");
  await db.$transaction(async (tx) => {
    await tx.communityMember.delete({ where: { id: member.id } });
    await tx.conversationMember.updateMany({
      where: { userId, conversation: { communityId }, leftAt: null },
      data: { leftAt: new Date(), pinnedAt: null },
    });
  });
  await publish("member.changed", { conversationId: "", userId }, toUsers([userId]));
  return { joined: false };
}

export async function firstRoomHref(userId: string) {
  const membership = await db.communityMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: "asc" },
    select: { community: { select: { slug: true } } },
  });
  return membership ? `/communities/${membership.community.slug}/general` : "/communities";
}

function toRoomIcon(icon: string | null): RoomIconView {
  return (icon?.toLowerCase() ?? "hash") as RoomIconView;
}

export type RoomPageResult =
  | { kind: "room"; page: CommunityRoomPage }
  | { kind: "preview"; community: CommunitySummary }
  | null;

export async function getRoomPage(userId: string, slug: string, roomSlug: string): Promise<RoomPageResult> {
  const community = await db.community.findUnique({ where: { slug }, include: summaryInclude() });
  if (!community) return null;
  const membership = await db.communityMember.findUnique({
    where: { communityId_userId: { communityId: community.id, userId } },
    select: { role: true },
  });
  if (!membership) {
    return community.visibility === "PUBLIC" ? { kind: "preview", community: toSummary(community, false, 0) } : null;
  }

  const [rooms, unread] = await Promise.all([
    db.conversation.findMany({
      where: { communityId: community.id, type: "ROOM" },
      orderBy: { createdAt: "asc" },
      select: { id: true, slug: true, title: true, roomIcon: true, description: true },
    }),
    roomUnread(userId),
  ]);
  const roomSummaries: RoomSummary[] = rooms.map((room) => ({
    id: room.id,
    slug: room.slug ?? room.id,
    name: room.title ?? "room",
    icon: toRoomIcon(room.roomIcon),
    topic: room.description,
    unread: unread.byRoom.get(room.id) ?? 0,
  }));
  const current = roomSummaries.find((room) => room.slug === roomSlug);
  if (!current) return null;

  await db.conversationMember.upsert({
    where: { conversationId_userId: { conversationId: current.id, userId } },
    create: { conversationId: current.id, userId, role: membership.role },
    update: { leftAt: null },
  });

  const [conversation, pinned, admins, people] = await Promise.all([
    getConversationView(userId, current.id),
    db.pinnedMessage.findFirst({
      where: { conversationId: current.id, message: { deletedAt: null } },
      orderBy: { createdAt: "desc" },
      select: { message: { select: { id: true, body: true, kind: true } } },
    }),
    db.communityMember.findMany({
      where: { communityId: community.id, role: { in: ["OWNER", "ADMIN"] } },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
      select: { role: true, user: { select: { ...personDetailSelect, settings: { select: { lastSeenVisibility: true } } } } },
    }),
    db.communityMember.findMany({
      where: { communityId: community.id, role: "MEMBER" },
      orderBy: { joinedAt: "asc" },
      take: 200,
      select: { role: true, user: { select: { ...personDetailSelect, settings: { select: { lastSeenVisibility: true } } } } },
    }),
  ]);

  const toMember = (row: (typeof people)[number]): MemberView => ({
    person: toPerson(row.user),
    role: row.role.toLowerCase() as MemberView["role"],
    online: row.user.id === userId || isOnline(row.user.id, row.user.settings?.lastSeenVisibility, false),
  });
  const adminViews = admins.map(toMember);
  const memberViews = people.map(toMember);
  const online = memberViews.filter((member) => member.online);
  const offline = memberViews.filter((member) => !member.online);
  const onlineTotal = online.length + adminViews.filter((member) => member.online).length;

  return {
    kind: "room",
    page: {
      community: { ...toSummary(community, true, unread.byCommunity.get(community.id) ?? 0), role: membership.role.toLowerCase() as MemberView["role"] },
      room: current,
      rooms: roomSummaries,
      conversation,
      pinned: pinned ? { id: pinned.message.id, text: pinned.message.body || "Attachment" } : null,
      admins: adminViews,
      online,
      offline,
      onlineCount: onlineTotal,
      offlineCount: community._count.members - onlineTotal,
      headerSample: [...adminViews, ...online].slice(0, 4).map((member) => ({
        initials: member.person.initials,
        tone: member.person.tone,
      })),
      extraCount: Math.max(0, community._count.members - 4),
    },
  };
}
