import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <section
      aria-labelledby="auth-title"
      className="w-full max-w-105 rounded-xl border border-line bg-card p-6 shadow-lg md:p-8"
    >
      <LogoMark />
      <h1 id="auth-title" className="mt-6 text-2xl font-semibold">
        {title}
      </h1>
      <p className="mt-1.5 text-base text-muted">{description}</p>
      <div className="mt-7">{children}</div>
      <p className="mt-6 border-t border-line pt-5 text-center text-sm text-muted">{footer}</p>
    </section>
  );
}
