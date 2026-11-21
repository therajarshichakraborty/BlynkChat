import type { Tone } from "@/types/tone";
import { firstName } from "./messages";

export const typingTtlMs = 5000;
export const typingThrottleMs = 3000;

export type Typist = { userId: string; name: string; initials: string; tone: Tone; until: number };

export function activeTypists(typists: Typist[], now = Date.now()) {
  return typists.filter((typist) => typist.until > now);
}

export function typingLabel(typists: Typist[], direct: boolean) {
  const [first, second] = typists;
  if (!first) return "";
  if (direct) return "typing…";
  if (!second) return `${firstName(first.name)} is typing…`;
  if (typists.length === 2) return `${firstName(first.name)} and ${firstName(second.name)} are typing…`;
  return `${firstName(first.name)} and ${typists.length - 1} others are typing…`;
}

export function sendTypingSignal(conversationId: string) {
  void fetch("/api/typing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
    keepalive: true,
  }).catch(() => undefined);
}
