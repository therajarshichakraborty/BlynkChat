"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useRealtime } from "@/lib/realtime-client";

const listEvents = new Set(["conversation.updated", "member.changed", "resync"]);

export function RealtimeBridge() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  useRealtime((event) => {
    if (!listEvents.has(event.type)) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => router.refresh(), 300);
  });

  return null;
}
