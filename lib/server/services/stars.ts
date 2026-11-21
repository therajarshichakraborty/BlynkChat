import "server-only";
import type { StarredItem } from "@/types/message";
import { initialsFor } from "@/lib/utils/initials";
import { db } from "../db";
import { notFound } from "../errors";
import { messageInclude, toMessageView } from "../views/messages";
import { toTone } from "../views/people";
import { requireMembership } from "./conversations";

export async function toggleStar(userId: string, messageId: string) {
  const message = await db.message.findUnique({ where: { id: messageId }, select: { conversationId: true, deletedAt: true } });
  if (!message || message.deletedAt) throw notFound("That message could not be found.");
  await requireMembership(userId, message.conversationId);
  const existing = await db.starredMessage.findUnique({
    where: { messageId_userId: { messageId, userId } },
    select: { id: true },
  });
  if (existing) {
    await db.starredMessage.delete({ where: { id: existing.id } });
    return { starred: false };
  }
  await db.starredMessage.create({ data: { messageId, userId } });
  return { starred: true };
}

export async function listStarred(userId: string): Promise<StarredItem[]> {
  const rows = await db.starredMessage.findMany({
    where: {
      userId,
      message: {
        deletedAt: null,
        hiddenFor: { none: { userId } },
        conversation: { members: { some: { userId, leftAt: null } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      message: {
        include: {
          ...messageInclude(userId),
          conversation: {
            select: {
              id: true,
              type: true,
              title: true,
              tone: true,
              slug: true,
              community: { select: { slug: true } },
              members: {
                where: { userId: { not: userId } },
                take: 1,
                select: { user: { select: { name: true, tone: true } } },
              },
            },
          },
        },
      },
    },
  });
  return rows.map(({ message }) => {
    const conversation = message.conversation;
    const peer = conversation.type === "DIRECT" ? conversation.members[0]?.user : undefined;
    const title = peer?.name ?? conversation.title ?? "Conversation";
    const href =
      conversation.type === "ROOM" && conversation.community && conversation.slug
        ? `/communities/${conversation.community.slug}/${conversation.slug}`
        : `/chats/${conversation.id}`;
    return {
      message: toMessageView(message, userId),
      conversation: {
        id: conversation.id,
        title,
        initials: initialsFor(title),
        tone: toTone(peer?.tone ?? conversation.tone),
        href,
      },
    };
  });
}
