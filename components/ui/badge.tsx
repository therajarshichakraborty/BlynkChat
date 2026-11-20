import { cn } from "@/lib/utils/cn";

type BadgeProps = {
  count: number;
  tone?: "accent" | "muted";
  label?: string;
  className?: string;
};

export function Badge({ count, tone = "accent", label, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-2xs font-semibold tabular-nums",
        tone === "accent" ? "bg-accent-solid text-on-accent" : "bg-raised text-muted",
        className,
      )}
    >
      {count}
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  );
}
