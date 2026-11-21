import "server-only";
import type { Prisma } from "@/prisma/generated/client";
import { initialsFor } from "@/lib/utils/initials";
import type { AttachmentView, MessageView, PollView, ReactionView } from "@/types/message";
import { personSelect, toSender, toTone } from "./people";

export function messageInclude(viewerId: string) {
  return {
    sender: { select: personSelect },
    replyTo: {
      select: { id: true, body: true, kind: true, deletedAt: true, sender: { select: { name: true } } },
    },
    attachments: { orderBy: { createdAt: "asc" } },
    reactions: { select: { emoji: true, userId: true }, orderBy: { createdAt: "asc" } },
    starredMessages: { where: { userId: viewerId }, select: { id: true } },
    pinnedMessages: { select: { id: true } },
    poll: {
      include: {
        options: { orderBy: { position: "asc" }, include: { votes: { select: { userId: true } } } },
      },
    },
    threadReplies: {
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { createdAt: true, sender: { select: { name: true, tone: true } } },
    },
    _count: { select: { threadReplies: { where: { deletedAt: null } } } },
  } satisfies Prisma.MessageInclude;
}

export type MessageRow = Prisma.MessageGetPayload<{ include: ReturnType<typeof messageInclude> }>;

type AttachmentRow = MessageRow["attachments"][number];

export function toAttachment(row: AttachmentRow): AttachmentView {
  return {
    id: row.id,
    kind: row.kind.toLowerCase() as AttachmentView["kind"],
    name: row.name,
    mime: row.mime,
    size: row.size,
    url: `/api/files/${row.id}`,
    width: row.width,
    height: row.height,
    durationMs: row.durationMs,
    waveform: Array.isArray(row.waveform)
      ? row.waveform.filter((value): value is number => typeof value === "number")
      : [],
  };
}

function groupReactions(rows: MessageRow["reactions"], viewerId: string): ReactionView[] {
  const grouped = new Map<string, ReactionView>();
  for (const row of rows) {
    const current = grouped.get(row.emoji) ?? { emoji: row.emoji, count: 0, mine: false };
    current.count += 1;
    current.mine ||= row.userId === viewerId;
    grouped.set(row.emoji, current);
  }
  return [...grouped.values()];
}

function toPoll(row: NonNullable<MessageRow["poll"]>, viewerId: string): PollView {
  const voters = new Set(row.options.flatMap((option) => option.votes.map((vote) => vote.userId)));
  const totalVotes = row.options.reduce((sum, option) => sum + option.votes.length, 0);
  return {
    id: row.id,
    question: row.question,
    multipleChoice: row.multipleChoice,
    totalVotes: voters.size,
    closed: row.closedAt !== null,
    options: row.options.map((option) => ({
      id: option.id,
      label: option.label,
      votes: option.votes.length,
      percent: totalVotes ? Math.round((option.votes.length / totalVotes) * 100) : 0,
      voted: option.votes.some((vote) => vote.userId === viewerId),
    })),
  };
}

function replyText(reply: NonNullable<MessageRow["replyTo"]>) {
  if (reply.deletedAt) return "This message was deleted";
  if (reply.body) return reply.body;
  return reply.kind === "VOICE" ? "Voice message" : reply.kind === "IMAGE" ? "Photo" : "Attachment";
}

export function toMessageView(row: MessageRow, viewerId: string): MessageView {
  const deleted = row.deletedAt !== null;
  const lastReply = row.threadReplies[0];
  return {
    id: row.id,
    conversationId: row.conversationId,
    clientId: row.senderId === viewerId ? row.clientId : null,
    sender: row.sender ? toSender(row.sender) : null,
    kind: row.kind.toLowerCase() as MessageView["kind"],
    body: deleted ? "" : row.body,
    createdAt: row.createdAt.toISOString(),
    editedAt: row.editedAt?.toISOString() ?? null,
    deleted,
    forwarded: row.forwarded,
    starred: row.starredMessages.length > 0,
    pinned: row.pinnedMessages.length > 0,
    replyTo: row.replyTo
      ? { id: row.replyTo.id, author: row.replyTo.sender?.name ?? "Deleted account", text: replyText(row.replyTo) }
      : null,
    attachments: deleted ? [] : row.attachments.map(toAttachment),
    reactions: deleted ? [] : groupReactions(row.reactions, viewerId),
    poll: !deleted && row.poll ? toPoll(row.poll, viewerId) : null,
    threadRootId: row.threadRootId,
    thread:
      row._count.threadReplies > 0 && lastReply
        ? {
            count: row._count.threadReplies,
            lastReplyAt: lastReply.createdAt.toISOString(),
            participants: row.threadReplies.map((reply) => ({
              initials: initialsFor(reply.sender?.name ?? "?"),
              tone: reply.sender ? toTone(reply.sender.tone) : "slate",
            })),
          }
        : null,
  };
}
