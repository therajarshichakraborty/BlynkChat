"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const immersive = [/^\/chats\/[^/]+$/, /^\/communities\/[^/]+\/[^/]+$/, /^\/groups\/new$/, /^\/video$/];

export function TabBarFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (immersive.some((pattern) => pattern.test(pathname))) return null;

  return (
    <nav
      aria-label="Primary"
      className="flex shrink-0 items-stretch border-t border-line bg-bg/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      {children}
    </nav>
  );
}
