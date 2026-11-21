import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-120 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,var(--hero-fade),transparent_70%)]"
      />
      <header className="mx-auto flex h-16 w-full max-w-page items-center justify-between px-4 md:px-8">
        <Logo />
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 md:items-center md:pt-0">
        {children}
      </main>
    </div>
  );
}
