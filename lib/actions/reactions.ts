"use server";

import { runAction } from "@/lib/server/action";
import { forwardMessage as forwardMessageService } from "@/lib/server/services/messages";
import { toggleReaction as toggleReactionService } from "@/lib/server/services/reactions";
import { toggleStar as toggleStarService } from "@/lib/server/services/stars";
import { messageIdSchema } from "@/lib/validation/messages";
import { forwardSchema, reactionSchema } from "@/lib/validation/reactions";

export async function toggleReaction(input: { messageId: string; emoji: string }) {
  return runAction(reactionSchema, input, (userId, data) => toggleReactionService(userId, data.messageId, data.emoji));
}

export async function toggleStar(input: { messageId: string }) {
  return runAction(messageIdSchema, input, (userId, data) => toggleStarService(userId, data.messageId));
}

export async function forwardMessage(input: { messageId: string; conversationIds: string[] }) {
  return runAction(forwardSchema, input, (userId, data) =>
    forwardMessageService(userId, data.messageId, data.conversationIds),
  );
}
