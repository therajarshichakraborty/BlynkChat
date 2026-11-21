import { z } from "zod";
import { idSchema } from "./common";

export const groupNameLimit = 48;
export const groupDescriptionLimit = 500;

export const groupImageSchema = z
  .string()
  .regex(/^\/api\/files\/[A-Za-z0-9_-]{1,64}$/, "Upload the group icon again.")
  .nullable();

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Give your group a name.").max(groupNameLimit, `Use up to ${groupNameLimit} characters.`),
  description: z.string().trim().max(groupDescriptionLimit, `Use up to ${groupDescriptionLimit} characters.`),
  memberIds: z.array(idSchema).min(1, "Add at least one member.").max(256, "Add up to 256 members at a time."),
  visibility: z.enum(["private", "public"]),
  approval: z.boolean(),
  disappearing: z.boolean(),
  adminsOnly: z.boolean(),
  image: groupImageSchema,
});

export type CreateGroupValues = z.input<typeof createGroupSchema>;

export const membersSchema = z.object({
  conversationId: idSchema,
  userIds: z.array(idSchema).min(1, "Pick at least one person.").max(256),
});

export const memberSchema = z.object({ conversationId: idSchema, userId: idSchema });

export const roleSchema = memberSchema.extend({ role: z.enum(["ADMIN", "MEMBER"]) });

export const inviteCodeSchema = z.object({ code: z.string().trim().min(8).max(64) });
