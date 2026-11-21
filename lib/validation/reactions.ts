import { z } from "zod";
import { idSchema } from "./common";

export const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉"];

export const reactionSchema = z.object({
  messageId: idSchema,
  emoji: z
    .string()
    .trim()
    .min(1, "Pick an emoji.")
    .max(16, "Pick a single emoji.")
    .regex(/^\p{Extended_Pictographic}/u, "Pick an emoji."),
});

export const forwardSchema = z.object({
  messageId: idSchema,
  conversationIds: z.array(idSchema).min(1, "Pick at least one chat.").max(5, "Forward to up to 5 chats at a time."),
});
