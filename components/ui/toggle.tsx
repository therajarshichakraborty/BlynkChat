import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "role">;

export function Toggle({ className, ...props }: ToggleProps) {
  return (
    <span className={cn("relative inline-flex h-6 w-10 shrink-0", className)}>
      <input
        type="checkbox"
        role="switch"
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
        {...props}
      />
      <span
        aria-hidden="true"
        className="h-6 w-10 rounded-full bg-line-strong transition-colors duration-200 ease-smooth peer-checked:bg-accent-solid peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent peer-disabled:opacity-50"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-smooth peer-checked:translate-x-4"
      />
    </span>
  );
}
