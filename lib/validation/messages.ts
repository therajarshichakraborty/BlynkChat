import { z } from "zod";
import { idSchema } from "./common";

export const messageBodyLimit = 4000;

export const loadOlderSchema = z.object({
  conversationId: idSchema,
  cursor: idSchema,
});

export const messageIdSchema = z.object({ messageId: idSchema });
