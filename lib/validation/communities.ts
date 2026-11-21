import { z } from "zod";
import { idSchema } from "./common";

export const communitySchema = z.object({
  name: z.string().trim().min(2, "Use at least 2 characters.").max(48, "Use up to 48 characters."),
  description: z.string().trim().max(300, "Use up to 300 characters."),
  category: z.enum(["technology", "design", "ml", "startups", "campus", "hobbies", "local"]),
  visibility: z.enum(["public", "private"]),
});

export type CommunityValues = z.input<typeof communitySchema>;

export const membershipSchema = z.object({ communityId: idSchema, join: z.boolean() });

export const threadSchema = z.object({ rootId: idSchema });
