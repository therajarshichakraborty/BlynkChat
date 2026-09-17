import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { usersTable } from "./user.schema";

export const conversationsTable = pgTable(
  "conversations", {
    id: uuid("id").defaultRandom().primaryKey(),
    isGroup: boolean("is_group").default(false).notNull(),
    groupName: varchar("group_name", { length: 255 }),
    groupDescription: text("group_description"),
    groupAvatar: text("group_avatar"),
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    lastMessageId: uuid("last_message_id"),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("conversations_created_by_idx").on(table.createdBy),
    index("conversations_last_message_at_idx").on(table.lastMessageAt),
  ]
);

export const conversationTable = conversationsTable;
export const chatsTable = conversationsTable;
export const chatTable = conversationsTable;
export const conversations = conversationsTable;

export type Conversation = typeof conversationsTable.$inferSelect;
export type NewConversation = typeof conversationsTable.$inferInsert;
export type ConversationTable = Conversation;
export type Chat = Conversation;
export type NewChat = NewConversation;

export const createDirectConversationSchema = z.object({
  recipientId: z.uuid("Invalid recipient user ID"),
});

export const createGroupConversationSchema = z.object({
  groupName: z.string().min(1, "Group name is required").max(100),
  groupDescription: z.string().max(500).optional().nullable(),
  groupAvatar: z.url("Invalid avatar URL").optional().nullable(),
  memberIds: z
    .array(z.uuid("Invalid user ID"))
    .min(1, "At least one member is required"),
});

export const updateGroupConversationSchema = z.object({
  groupName: z.string().min(1).max(100).optional(),
  groupDescription: z.string().max(500).optional().nullable(),
  groupAvatar: z.url().optional().nullable(),
});

export default conversationsTable;
