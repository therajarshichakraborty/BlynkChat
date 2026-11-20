import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type KbdProps = {
  children: ReactNode;
  className?: string;
};

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 items-center rounded-[5px] border border-line bg-card px-1.5 font-sans text-2xs font-medium text-muted",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
