import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod";

export const userTable = pgTable("user", {
  username: varchar("username", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique(),
  hashedPassword: varchar("hashedPassword", { length: 255 }).notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  bio: varchar("bio", { length: 255 }).notNull(),
  profileImageUrl:varchar("profileImageUrl", { length: 255 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
})


export type UserTable = z.infer<typeof userTable>;