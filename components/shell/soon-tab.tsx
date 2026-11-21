import type { ReactNode } from "react";

type SoonTabProps = {
  label: string;
  children: ReactNode;
};

export function SoonTab({ label, children }: SoonTabProps) {
  return (
    <span
      aria-disabled="true"
      title={`${label} coming soon`}
      className="flex min-h-12 flex-1 flex-col items-center justify-center gap-1 text-2xs font-medium text-faint"
    >
      {children}
      {label}
      <span className="sr-only">, coming soon</span>
    </span>
  );
}
