import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { messagesTable } from "./message.schema";

export const attachmentsTable = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  messageId: uuid("message_id").references(() => messagesTable.id, {
    onDelete: "cascade",
  }),
  uploadedBy: uuid("uploaded_by")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  publicId: varchar("public_id", { length: 255 }), 
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(), 
  fileSize: integer("file_size").notNull(), 
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const attachmentTable = attachmentsTable;
export const attachments = attachmentsTable;

export type Attachment = typeof attachmentsTable.$inferSelect;
export type NewAttachment = typeof attachmentsTable.$inferInsert;

export default attachmentsTable;
