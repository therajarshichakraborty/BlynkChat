import type { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function collectFieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors as FieldErrors<T>;
}

export function hasErrors<T>(errors: FieldErrors<T>) {
  return Object.values(errors).some(Boolean);
}
