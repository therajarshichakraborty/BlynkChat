import "server-only";
import type { RealtimeEventMap, RealtimeEventType } from "@/types/realtime";
import { db } from "../db";
import { channel, maxPayloadBytes, newEventId, type Audience } from "./envelope";

export async function publish<K extends Exclude<RealtimeEventType, "resync">>(
  type: K,
  data: RealtimeEventMap[K],
  audience: Audience,
) {
  const at = Date.now();
  const payload = JSON.stringify({ id: newEventId(at), type, data, audience, at });
  if (Buffer.byteLength(payload, "utf8") > maxPayloadBytes) {
    console.error(`[relay:realtime] dropped oversized ${type} event`);
    return;
  }
  try {
    await db.$executeRaw`select pg_notify(${channel}, ${payload})`;
  } catch (error) {
    console.error("[relay:realtime] publish failed", error);
  }
}

export function toConversation(conversationId: string, except?: string[]): Audience {
  return except?.length ? { kind: "conversation", conversationId, except } : { kind: "conversation", conversationId };
}

export function toUsers(userIds: string[]): Audience {
  return { kind: "users", userIds: [...new Set(userIds)] };
}
