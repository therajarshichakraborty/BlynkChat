import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ChipLinkProps = {
  href: Route;
  active: boolean;
  children: ReactNode;
  count?: number;
};

export function ChipLink({ href, active, children, count }: ChipLinkProps) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-150",
        active
          ? "bg-inverse text-on-inverse"
          : "border border-line text-muted hover:bg-surface hover:text-fg",
      )}
    >
      {children}
      {count ? (
        <span className={cn("text-2xs tabular-nums", active ? "opacity-70" : "text-muted")}>
          {count}
        </span>
      ) : null}
    </Link>
  );
}
