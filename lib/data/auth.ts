import type { LoginValues } from "@/lib/validation/auth";

export type AuthResult = { ok: true } | { ok: false; error: string };

function settle(): Promise<AuthResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ok: true }), 700);
  });
}

export function signIn(values: LoginValues): Promise<AuthResult> {
  return values.email ? settle() : Promise.resolve({ ok: false, error: "Missing email." });
}
