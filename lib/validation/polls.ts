import { z } from "zod";
import { idSchema } from "./common";

export const pollOptionLimit = 12;

export const createPollSchema = z.object({
  conversationId: idSchema,
  question: z.string().trim().min(1, "Ask a question.").max(200, "Keep the question under 200 characters."),
  options: z
    .array(z.string().trim().max(80, "Keep options under 80 characters."))
    .min(2, "Add at least two options.")
    .max(pollOptionLimit, `Add up to ${pollOptionLimit} options.`),
  multipleChoice: z.boolean(),
});

export type CreatePollValues = z.input<typeof createPollSchema>;

export const voteSchema = z.object({ pollId: idSchema, optionId: idSchema });
