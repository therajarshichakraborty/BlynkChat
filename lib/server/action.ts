import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import type { ActionErrorCode, ActionResult } from "@/types/action";
import { ServiceError } from "./errors";
import { getSessionUser } from "./session";

function failure(code: ActionErrorCode, message: string, fields?: Record<string, string>): ActionResult<never> {
  return { ok: false, error: fields ? { code, message, fields } : { code, message } };
}

function fieldErrors(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export async function runAction<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  handler: (userId: string, data: z.output<S>) => Promise<T>,
): Promise<ActionResult<T>> {
  const user = await getSessionUser();
  if (!user) return failure("UNAUTHORIZED", "Your session has ended. Log in again.");

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return failure("VALIDATION", parsed.error.issues[0]?.message ?? "Check the details and try again.", fieldErrors(parsed.error));
  }

  try {
    return { ok: true, data: await handler(user.id, parsed.data) };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ServiceError) return failure(error.code, error.message, error.fields);
    console.error("[relay:action]", error);
    return failure("INTERNAL", "Something went wrong. Try again in a moment.");
  }
}
