import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      <span className="inline-grid size-14 place-items-center rounded-xl border border-line bg-surface text-accent-text shadow-xs">
        {icon}
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-base text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
