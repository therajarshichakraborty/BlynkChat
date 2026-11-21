import "server-only";
import { randomBytes } from "node:crypto";
import type { MessageView } from "@/types/message";
import { db } from "../db";
import { forbidden, invalid, notFound } from "../errors";
import { publish, toConversation } from "../realtime/publish";
import { assertWithinLimit } from "../rate-limit";
import { messageInclude, toMessageView } from "../views/messages";
import { requireMembership } from "./conversations";
import { assertCanPost } from "./messages";

export type CreatePollInput = {
  conversationId: string;
  question: string;
  options: string[];
  multipleChoice: boolean;
};

export async function createPoll(userId: string, input: CreatePollInput): Promise<MessageView> {
  const member = await assertCanPost(userId, input.conversationId);
  if (member.conversation.type === "DIRECT") throw forbidden("Polls work in groups and rooms.");
  const labels = input.options.map((option) => option.trim()).filter(Boolean);
  if (new Set(labels.map((label) => label.toLowerCase())).size !== labels.length) {
    throw invalid("Each option needs to be different.", { options: "Each option needs to be different." });
  }
  if (labels.length < 2) throw invalid("Add at least two options.", { options: "Add at least two options." });
  assertWithinLimit("send", userId);

  const now = new Date();
  const seconds = member.conversation.disappearingSeconds;
  const message = await db.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: {
        conversationId: input.conversationId,
        senderId: userId,
        clientId: `poll-${now.getTime()}-${randomBytes(4).toString("hex")}`,
        kind: "POLL",
        body: input.question,
        createdAt: now,
        expiresAt: seconds ? new Date(now.getTime() + seconds * 1000) : null,
        poll: {
          create: {
            question: input.question,
            multipleChoice: input.multipleChoice,
            options: { create: labels.map((label, position) => ({ label, position })) },
          },
        },
      },
      select: { id: true },
    });
    await tx.conversation.update({ where: { id: input.conversationId }, data: { lastMessageAt: now } });
    await tx.conversationMember.update({
      where: { id: member.id },
      data: { lastReadMessageId: created.id, lastReadAt: now },
    });
    return tx.message.findUniqueOrThrow({ where: { id: created.id }, include: messageInclude(userId) });
  });

  await publish(
    "message.created",
    { conversationId: input.conversationId, messageId: message.id, senderId: userId, threadRootId: null },
    toConversation(input.conversationId),
  );
  return toMessageView(message, userId);
}

export async function votePoll(userId: string, pollId: string, optionId: string): Promise<MessageView> {
  const poll = await db.poll.findUnique({
    where: { id: pollId },
    include: { message: { select: { id: true, conversationId: true, deletedAt: true } }, options: { select: { id: true } } },
  });
  if (!poll || poll.message.deletedAt) throw notFound("That poll could not be found.");
  if (poll.closedAt) throw invalid("This poll is closed.");
  if (!poll.options.some((option) => option.id === optionId)) throw invalid("That option isn't part of this poll.");
  await requireMembership(userId, poll.message.conversationId);

  await db.$transaction(async (tx) => {
    const existing = await tx.pollVote.findUnique({ where: { optionId_userId: { optionId, userId } }, select: { id: true } });
    if (existing) {
      await tx.pollVote.delete({ where: { id: existing.id } });
      return;
    }
    if (!poll.multipleChoice) await tx.pollVote.deleteMany({ where: { pollId, userId } });
    await tx.pollVote.create({ data: { pollId, optionId, userId } });
  });

  await publish(
    "poll.updated",
    { conversationId: poll.message.conversationId, messageId: poll.message.id },
    toConversation(poll.message.conversationId),
  );
  const row = await db.message.findUniqueOrThrow({ where: { id: poll.message.id }, include: messageInclude(userId) });
  return toMessageView(row, userId);
}
