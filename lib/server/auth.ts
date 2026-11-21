import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { usernameRules } from "@/lib/validation/auth";
import { db } from "./db";
import { env } from "./env";

function logEmail(subject: string, to: string, url: string) {
  if (env.NODE_ENV !== "production") {
    console.info(`[relay:email] ${subject} for ${to}: ${url}`);
  }
}

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    requireEmailVerification: false,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      logEmail("Reset your password", user.email, url);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      logEmail("Verify your email", user.email, url);
    },
  },
  user: {
    deleteUser: { enabled: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-in/username": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.userSettings.create({ data: { userId: user.id } });
        },
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: usernameRules.min,
      maxUsernameLength: usernameRules.max,
      usernameValidator: (value) => usernameRules.pattern.test(value),
      usernameNormalization: (value) => value.toLowerCase(),
      validationOrder: { username: "post-normalization" },
    }),
    nextCookies(),
  ],
});
