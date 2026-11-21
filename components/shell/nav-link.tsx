"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useUnreadTotal } from "./unread-provider";

type NavLinkProps = {
  href: Route;
  match: string;
  label: string;
  children: ReactNode;
  variant: "rail" | "tab";
  badge?: number;
  liveUnread?: boolean;
  exact?: boolean;
};

export function NavLink({ href, match, label, children, variant, badge: staticBadge, liveUnread = false, exact = false }: NavLinkProps) {
  const pathname = usePathname();
  const unread = useUnreadTotal();
  const badge = liveUnread ? unread : staticBadge;
  const active = pathname === match || (!exact && pathname.startsWith(`${match}/`));

  if (variant === "tab") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex min-h-12 flex-1 flex-col items-center justify-center gap-1 text-2xs font-medium transition-colors duration-150",
          active ? "text-accent-text" : "text-muted hover:text-fg",
        )}
      >
        <span className="relative">
          {children}
          {badge ? (
            <span className="absolute -top-1.5 -right-2.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-accent-solid px-1 text-[10px] font-semibold text-on-accent">
              {badge}
            </span>
          ) : null}
        </span>
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-grid size-11 place-items-center rounded-lg transition-colors duration-150",
        active
          ? "border border-line bg-card text-fg shadow-sm before:absolute before:top-1/2 before:-left-3.5 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-accent"
          : "text-muted hover:bg-raised hover:text-fg",
      )}
    >
      {children}
      {badge ? (
        <span className="absolute top-2 right-2 size-2 rounded-full bg-accent ring-2 ring-surface">
          <span className="sr-only">{badge} unread</span>
        </span>
      ) : null}
    </Link>
  );
}
