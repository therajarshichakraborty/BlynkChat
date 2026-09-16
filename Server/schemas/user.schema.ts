import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { z } from "zod";


export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    avatar: text("avatar"),
    bio: text("bio"),
    phoneNumber: varchar("phone_number", { length: 20 }),
    isOnline: boolean("is_online").default(false).notNull(),
    lastSeen: timestamp("last_seen", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    uniqueIndex("users_username_idx").on(table.username),
    index("users_is_online_idx").on(table.isOnline),
  ]
);

export const userTable = usersTable;
export const users = usersTable;

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type UserTable = User;
export type SafeUser = Omit<User, "password">;

export function sanitizeUser(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .toLowerCase()
    .trim(),
  email: z.email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  avatar: z.url("Invalid avatar URL").optional().nullable(),
  bio: z
    .string()
    .max(300, "Bio cannot exceed 300 characters")
    .optional()
    .nullable(),
  phoneNumber: z.string().max(20).optional().nullable(),
});

export const updateUserSchema = insertUserSchema
  .partial()
  .omit({ password: true });

export const loginUserSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export default usersTable;
