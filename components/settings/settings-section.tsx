import type { ReactNode } from "react";

type SettingsSectionProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsSection({ id, title, description, children }: SettingsSectionProps) {
  return (
    <section
      aria-labelledby={id}
      className="rounded-xl border border-line bg-card shadow-sm"
    >
      <div className="border-b border-line px-5 py-4 md:px-6">
        <h2 id={id} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted">{description}</p>
      </div>
      <div className="px-5 py-2 md:px-6">{children}</div>
    </section>
  );
}
