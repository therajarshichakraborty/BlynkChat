import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/client";
import { env } from "./env";

const globalForDb = globalThis as typeof globalThis & { relayDb?: PrismaClient };

function createClient() {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: env.DATABASE_URL }) });
}

export const db = globalForDb.relayDb ?? createClient();

if (env.NODE_ENV !== "production") {
  globalForDb.relayDb = db;
}
