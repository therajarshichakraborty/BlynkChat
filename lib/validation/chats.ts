import { z } from "zod";

export const chatListSchema = z.object({
  filter: z.enum(["all", "unread", "groups", "rooms", "archived"]),
  query: z.string().trim().max(100),
});
