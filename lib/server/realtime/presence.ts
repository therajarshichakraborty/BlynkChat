import "server-only";
import type { Audience as Visibility } from "@/prisma/generated/client";
import { hub } from "./hub";

type PresenceState = {
  remoteOnline: Set<string>;
  offlineTimers: Map<string, ReturnType<typeof setTimeout>>;
  detach: (() => void) | null;
};

const globalForPresence = globalThis as typeof globalThis & { relayPresence?: PresenceState };

const state: PresenceState = globalForPresence.relayPresence ?? {
  remoteOnline: new Set<string>(),
  offlineTimers: new Map(),
  detach: null,
};
globalForPresence.relayPresence = state;

if (!state.detach) {
  state.detach = hub.onEnvelope((envelope) => {
    if (envelope.type !== "presence") return;
    if (envelope.data.online) state.remoteOnline.add(envelope.data.userId);
    else state.remoteOnline.delete(envelope.data.userId);
  });
}

export function isConnected(userId: string) {
  return hub.connectionsFor(userId) > 0 || state.remoteOnline.has(userId);
}

export function cancelOffline(userId: string) {
  const timer = state.offlineTimers.get(userId);
  if (!timer) return false;
  clearTimeout(timer);
  state.offlineTimers.delete(userId);
  return true;
}

export function scheduleOffline(userId: string, delayMs: number, onOffline: () => void) {
  cancelOffline(userId);
  state.offlineTimers.set(
    userId,
    setTimeout(() => {
      state.offlineTimers.delete(userId);
      if (hub.connectionsFor(userId) === 0) onOffline();
    }, delayMs),
  );
}

export function presenceVisible(visibility: Visibility | undefined, sharesDirect: boolean) {
  if (visibility === "NOBODY") return false;
  if (visibility === "CONTACTS") return sharesDirect;
  return true;
}

export function isOnline(userId: string, visibility: Visibility | undefined, sharesDirect: boolean) {
  return presenceVisible(visibility, sharesDirect) && isConnected(userId);
}
