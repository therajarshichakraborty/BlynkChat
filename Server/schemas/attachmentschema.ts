import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { usersTable } from "./user.schema";
import { messagesTable } from "./message.schema";

/**
 * PostgreSQL Attachments Table Definition for BlynkChat
 */
export const attachmentsTable = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").references(() => messagesTable.id, {
    onDelete: "cascade",
  }),
  uploadedBy: uuid("uploaded_by")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  publicId: varchar("public_id", { length: 255 }), // Cloudinary or S3 public ID
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(), // MIME type
  fileSize: integer("file_size").notNull(), // Size in bytes
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const attachmentTable = attachmentsTable;
export const attachments = attachmentsTable;

export type Attachment = typeof attachmentsTable.$inferSelect;
export type NewAttachment = typeof attachmentsTable.$inferInsert;

export default attachmentsTable;
