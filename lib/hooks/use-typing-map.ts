import { useEffect, useState } from "react";
import { activeTypists, typingTtlMs, type Typist } from "@/lib/utils/typing";

type TypingMap = Record<string, Typist[]>;

function prune(map: TypingMap) {
  const next: TypingMap = {};
  for (const [key, typists] of Object.entries(map)) {
    const active = activeTypists(typists);
    if (active.length > 0) next[key] = active;
  }
  return next;
}

export function useTypingMap() {
  const [map, setMap] = useState<TypingMap>({});

  useEffect(() => {
    const all = Object.values(map).flat();
    if (all.length === 0) return;
    const next = Math.min(...all.map((typist) => typist.until)) - Date.now();
    const timer = setTimeout(() => setMap((current) => prune(current)), Math.max(50, next));
    return () => clearTimeout(timer);
  }, [map]);

  function add(key: string, typist: Omit<Typist, "until">) {
    setMap((current) => ({
      ...current,
      [key]: [
        ...activeTypists(current[key] ?? []).filter((item) => item.userId !== typist.userId),
        { ...typist, until: Date.now() + typingTtlMs },
      ],
    }));
  }

  function remove(key: string, userId: string) {
    setMap((current) => ({ ...current, [key]: (current[key] ?? []).filter((item) => item.userId !== userId) }));
  }

  return { map, add, remove };
}
