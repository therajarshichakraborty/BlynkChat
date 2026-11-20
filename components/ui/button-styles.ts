import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "dark" | "outline" | "ghost" | "soft";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "pill" | "rounded";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  block?: boolean;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent-solid text-on-accent shadow-accent hover:bg-accent disabled:shadow-none",
  dark: "bg-inverse text-on-inverse shadow-sm hover:opacity-90",
  outline: "border border-line bg-card text-fg shadow-xs hover:bg-surface",
  ghost: "text-fg hover:bg-raised",
  soft: "bg-accent-soft text-accent-text hover:bg-accent-line",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-base",
  lg: "h-12 gap-2 px-6 text-md",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  shape = "pill",
  block = false,
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-[background-color,color,box-shadow,opacity] duration-150 ease-smooth disabled:opacity-50 aria-disabled:opacity-50",
    shape === "pill" ? "rounded-full" : "rounded-lg",
    variantClasses[variant],
    sizeClasses[size],
    block && "w-full",
    className,
  );
}
