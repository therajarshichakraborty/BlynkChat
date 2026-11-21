import type { ReactNode } from "react";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils/cn";

type ProfileActionProps = {
  icon: ReactNode;
  label: string;
  soon?: boolean;
};

export function ProfileAction({ icon, label, soon = false }: ProfileActionProps) {
  return (
    <li className="relative flex-1">
      {soon ? (
        <Tag className="absolute -top-2.5 left-1/2 z-10 -translate-x-1/2" aria-hidden="true">
          Soon
        </Tag>
      ) : null}
      <button
        type="button"
        disabled={soon}
        aria-label={soon ? `${label}, coming soon` : label}
        className={cn(
          "flex h-17 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-line bg-card text-sm font-medium shadow-xs transition-colors duration-150",
          soon ? "text-muted disabled:opacity-100" : "hover:bg-surface",
        )}
      >
        {icon}
        {label}
      </button>
    </li>
  );
}
