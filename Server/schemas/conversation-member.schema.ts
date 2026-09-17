import {
  boolean,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { usersTable } from "./user.schema";
import { conversationsTable } from "./conversation.schema";

export const conversationMembersTable = pgTable(
  "conversation_members", {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversationsTable.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    role: varchar("role", { length: 20 }).default("member").notNull(), // 'admin' | 'member'
    lastReadMessageId: uuid("last_read_message_id"),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    isMuted: boolean("is_muted").default(false).notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("conversation_member_unique_idx").on(
      table.conversationId,
      table.userId
    ),
  ]
);

export const conversationMemberTable = conversationMembersTable;
export const conversationMembers = conversationMembersTable;

export type ConversationMember = typeof conversationMembersTable.$inferSelect;
export type NewConversationMember =
  typeof conversationMembersTable.$inferInsert;

export const addMemberSchema = z.object({
  conversationId: z.uuid("Invalid conversation ID"),
  userId: z.uuid("Invalid user ID"),
  role: z.enum(["admin", "member"]).default("member"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

export default conversationMembersTable;
