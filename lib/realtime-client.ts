import { useEffect, useEffectEvent } from "react";
import type { RealtimeEvent } from "@/types/realtime";

type Listener = (event: RealtimeEvent) => void;

const listeners = new Set<Listener>();
let source: EventSource | null = null;
let lastEventId = "";
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let attempts = 0;
let users = 0;

function emit(event: RealtimeEvent) {
  for (const listener of listeners) listener(event);
}

function isRealtimeEvent(value: unknown): value is RealtimeEvent {
  return typeof value === "object" && value !== null && "type" in value && "data" in value;
}

function scheduleReconnect() {
  if (retryTimer || users === 0) return;
  const delay = Math.min(30_000, 1000 * 2 ** attempts) + Math.random() * 500;
  attempts += 1;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    open();
  }, delay);
}

function open() {
  if (source || users === 0) return;
  const url = lastEventId ? `/api/realtime?lastEventId=${encodeURIComponent(lastEventId)}` : "/api/realtime";
  const next = new EventSource(url);
  source = next;
  next.onopen = () => {
    attempts = 0;
  };
  next.onmessage = (message: MessageEvent<string>) => {
    if (message.lastEventId) lastEventId = message.lastEventId;
    try {
      const parsed: unknown = JSON.parse(message.data);
      if (isRealtimeEvent(parsed)) emit(parsed);
    } catch {}
  };
  next.onerror = () => {
    if (next.readyState !== EventSource.CLOSED) return;
    next.close();
    if (source === next) source = null;
    scheduleReconnect();
  };
}

function retain() {
  users += 1;
  open();
}

function release() {
  users -= 1;
  if (users > 0) return;
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  source?.close();
  source = null;
}

export function useRealtime(handler: Listener) {
  const onEvent = useEffectEvent(handler);
  useEffect(() => {
    const listener: Listener = (event) => onEvent(event);
    listeners.add(listener);
    retain();
    return () => {
      listeners.delete(listener);
      release();
    };
  }, []);
}
