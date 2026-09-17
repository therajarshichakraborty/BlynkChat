import {
  type AnyPgColumn,
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
import { conversationsTable } from "./conversation.schema";

export const messagesTable = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => conversationsTable.id, { onDelete: "cascade" })
      .notNull(),
    senderId: uuid("sender_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content"),
    messageType: varchar("message_type", { length: 20 })
      .default("text")
      .notNull(),
    imageUrl: text("image_url"),
    fileUrl: text("file_url"),
    fileName: varchar("file_name", { length: 255 }),
    fileSize: varchar("file_size", { length: 50 }),
    replyToId: uuid("reply_to_id").references(
      (): AnyPgColumn => messagesTable.id, {
        onDelete: "set null",
      }
    ),
    isEdited: boolean("is_edited").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt
    ),
    index("messages_sender_id_idx").on(table.senderId),
    index("messages_reply_to_id_idx").on(table.replyToId),
  ]
);

export const messageTable = messagesTable;
export const messages = messagesTable;

export type Message = typeof messagesTable.$inferSelect;
export type NewMessage = typeof messagesTable.$inferInsert;
export type MessageTable = Message;

export const createMessageSchema = z
  .object({
    conversationId: z.uuid("Invalid conversation ID"),
    content: z.string().max(5000, "Message is too long").optional(),
    messageType: z
      .enum(["text", "image", "file", "audio", "video", "system"])
      .default("text"),
    imageUrl: z.url("Invalid image URL").optional().nullable(),
    fileUrl: z.url("Invalid file URL").optional().nullable(),
    fileName: z.string().max(255).optional().nullable(),
    fileSize: z.string().max(50).optional().nullable(),
    replyToId: z
      .uuid("Invalid replyTo message ID")
      .optional()
      .nullable(),
  })
  .refine((data) => data.content?.trim() || data.imageUrl || data.fileUrl, {
    message: "Message must contain either text content or an attachment",
  });

export const updateMessageSchema = z.object({
  content: z.string().min(1, "Message content cannot be empty").max(5000),
});

export const getMessagesQuerySchema = z.object({
  conversationId: z.uuid("Invalid conversation ID"),
  cursor: z.uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export default messagesTable;
