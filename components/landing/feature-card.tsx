import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type FeatureCardProps = {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function FeatureCard({ id, icon, title, description, children, className }: FeatureCardProps) {
  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "flex scroll-mt-24 flex-col gap-6 overflow-hidden rounded-xl border border-line bg-card p-6 shadow-sm md:p-7",
        className,
      )}
    >
      <div className="flex flex-col">
        <span className="inline-grid size-8 place-items-center rounded-md bg-accent-soft text-accent-text">
          {icon}
        </span>
        <h3 id={`${id}-title`} className="mt-5 text-lg font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mt-2 max-w-md text-base text-muted">{description}</p>
      </div>
      {children}
    </article>
  );
}
