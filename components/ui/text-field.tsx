import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
  labelAction?: ReactNode;
};

export function fieldShellClasses(invalid: boolean, className?: string) {
  return cn(
    "flex w-full items-center gap-2 rounded-lg border bg-card px-3.5 shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:ring-4 focus-within:ring-ring",
    invalid ? "border-danger focus-within:border-danger" : "border-line",
    className,
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  trailing,
  labelAction,
  className,
  ...props
}: TextFieldProps) {
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        {labelAction}
      </div>
      <div className={fieldShellClasses(Boolean(error))}>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className="h-11 min-w-0 flex-1 bg-transparent text-md outline-none disabled:opacity-60"
          {...props}
        />
        {trailing}
      </div>
      {message ? (
        <p
          id={messageId}
          className={cn("text-xs", error ? "text-danger-text" : "text-muted")}
          aria-live={error ? "polite" : undefined}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
