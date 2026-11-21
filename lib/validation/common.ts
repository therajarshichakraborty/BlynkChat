import { z } from "zod";

export const idSchema = z.string().trim().min(1, "Missing id.").max(64, "Invalid id.");

export const optionalIdSchema = idSchema.optional();
