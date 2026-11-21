import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <li className="flex flex-col rounded-lg border border-line bg-surface p-5 md:p-6">
      <span className="text-accent-text">{icon}</span>
      <span className="mt-6 text-3xl font-semibold md:text-4xl">{value}</span>
      <span className="mt-1 text-sm text-muted">{label}</span>
    </li>
  );
}
