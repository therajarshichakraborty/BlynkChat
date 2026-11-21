"use server";

import { runAction } from "@/lib/server/action";
import { togglePin as togglePinService } from "@/lib/server/services/pins";
import { createPoll as createPollService, votePoll } from "@/lib/server/services/polls";
import { messageIdSchema } from "@/lib/validation/messages";
import { createPollSchema, voteSchema, type CreatePollValues } from "@/lib/validation/polls";

export async function createPoll(input: CreatePollValues) {
  return runAction(createPollSchema, input, (userId, data) => createPollService(userId, data));
}

export async function vote(input: { pollId: string; optionId: string }) {
  return runAction(voteSchema, input, (userId, data) => votePoll(userId, data.pollId, data.optionId));
}

export async function togglePin(input: { messageId: string }) {
  return runAction(messageIdSchema, input, (userId, data) => togglePinService(userId, data.messageId));
}
