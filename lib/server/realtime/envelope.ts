import "server-only";
import { randomBytes } from "node:crypto";
import type { RealtimeEvent } from "@/types/realtime";

export const channel = "relay_events";

export const maxPayloadBytes = 7900;

export type Audience =
  | { kind: "users"; userIds: string[] }
  | { kind: "conversation"; conversationId: string; except?: string[] }
  | { kind: "contacts"; userId: string; directOnly: boolean };

export type Envelope = RealtimeEvent & { audience: Audience; at: number };

export function newEventId(at: number) {
  return `${at.toString(36)}-${randomBytes(4).toString("hex")}`;
}

export function isEnvelope(value: unknown): value is Envelope {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Envelope>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.at === "number" &&
    typeof candidate.data === "object" &&
    typeof candidate.audience === "object"
  );
}

export function toClientEvent(envelope: Envelope): RealtimeEvent {
  return { id: envelope.id, type: envelope.type, data: envelope.data } as RealtimeEvent;
}
