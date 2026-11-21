import { useEffect, useState } from "react";
import { activeTypists, typingTtlMs, type Typist } from "@/lib/utils/typing";

export function useTypists() {
  const [typists, setTypists] = useState<Typist[]>([]);

  useEffect(() => {
    if (typists.length === 0) return;
    const next = Math.min(...typists.map((typist) => typist.until)) - Date.now();
    const timer = setTimeout(() => setTypists((current) => activeTypists(current)), Math.max(50, next));
    return () => clearTimeout(timer);
  }, [typists]);

  function add(typist: Omit<Typist, "until">) {
    setTypists((current) => [
      ...activeTypists(current).filter((item) => item.userId !== typist.userId),
      { ...typist, until: Date.now() + typingTtlMs },
    ]);
  }

  function remove(userId: string) {
    setTypists((current) => current.filter((item) => item.userId !== userId));
  }

  return { typists, add, remove };
}
