import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TagVariant = "accent" | "solid" | "success" | "neutral";

type TagProps = {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
};

const variantClasses: Record<TagVariant, string> = {
  accent: "bg-accent-soft text-accent-text",
  solid: "bg-accent-solid text-on-accent",
  success: "bg-success-soft text-success-text",
  neutral: "bg-raised text-muted",
};

export function Tag({ children, variant = "accent", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 text-2xs font-semibold tracking-wide uppercase",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
