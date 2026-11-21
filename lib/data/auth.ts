import type { LoginValues, SignupValues } from "@/lib/validation/auth";

type AuthResult = { ok: true } | { ok: false; error: string };

const takenUsernames = new Set(["arjun", "ananya", "relay"]);

function settle(result: AuthResult): Promise<AuthResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), 700);
  });
}

export function signIn(values: LoginValues): Promise<AuthResult> {
  return settle(values.email ? { ok: true } : { ok: false, error: "Missing email." });
}

export function signUp(values: SignupValues): Promise<AuthResult> {
  return settle(
    takenUsernames.has(values.username)
      ? { ok: false, error: `@${values.username} is already taken. Try another username.` }
      : { ok: true },
  );
}
