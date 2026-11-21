import { z } from "zod";
import { idSchema } from "./common";

export const messageBodyLimit = 4000;

const bodySchema = z.string().max(messageBodyLimit, `Messages can be up to ${messageBodyLimit} characters.`);

export const loadOlderSchema = z.object({
  conversationId: idSchema,
  cursor: idSchema,
});

export const conversationIdSchema = z.object({ conversationId: idSchema });

export const markReadSchema = z.object({ conversationId: idSchema, messageId: idSchema });

export const messageIdSchema = z.object({ messageId: idSchema });

export const sendMessageSchema = z.object({
  conversationId: idSchema,
  clientId: z.string().trim().min(8, "Invalid message id.").max(64, "Invalid message id."),
  body: bodySchema,
  replyToId: idSchema.optional(),
  threadRootId: idSchema.optional(),
  attachmentIds: z.array(idSchema).max(10, "Attach up to 10 files at a time.").optional(),
});

export const editMessageSchema = z.object({
  messageId: idSchema,
  body: bodySchema.trim().min(1, "A message cannot be empty."),
});

export const deleteMessageSchema = z.object({
  messageId: idSchema,
  scope: z.enum(["me", "everyone"]),
});

export type SendMessageValues = z.input<typeof sendMessageSchema>;
