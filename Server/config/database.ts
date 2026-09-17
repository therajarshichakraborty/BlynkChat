import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";

export const db = drizzle({
    connection: {
      connectionString: env.DATABASE_URL as string,
      ssl: true,
    },
});
