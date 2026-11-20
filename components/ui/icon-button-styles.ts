import { cn } from "@/lib/utils/cn";

export type IconButtonVariant = "ghost" | "outline" | "accent" | "soft";
export type IconButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: "text-muted hover:bg-raised hover:text-fg",
  outline: "border border-line bg-card text-fg shadow-xs hover:bg-surface",
  accent: "bg-accent-solid text-on-accent shadow-accent hover:bg-accent",
  soft: "bg-accent-soft text-accent-text hover:bg-accent-line",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-8 rounded-md",
  md: "size-10 rounded-md",
  lg: "size-11 rounded-lg",
};

export function iconButtonClasses(
  variant: IconButtonVariant = "ghost",
  size: IconButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-grid shrink-0 place-items-center transition-colors duration-150 ease-smooth disabled:opacity-50 aria-disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}
