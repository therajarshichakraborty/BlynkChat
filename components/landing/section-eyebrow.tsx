import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SectionEyebrowProps = {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionEyebrow({ icon, children, className }: SectionEyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border border-accent-line bg-accent-soft px-3 text-sm font-medium text-accent-text",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
