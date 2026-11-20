import type { InputHTMLAttributes } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { cn } from "@/lib/utils/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <span className={cn("relative inline-grid size-5 shrink-0 place-items-center", className)}>
      <input
        type="checkbox"
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none opacity-0"
        {...props}
      />
      <span
        aria-hidden="true"
        className="size-5 rounded-[6px] border border-line-strong bg-card transition-colors duration-150 peer-checked:border-accent-solid peer-checked:bg-accent-solid peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
      />
      <CheckIcon
        size={14}
        strokeWidth={2.5}
        className="pointer-events-none absolute text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
      />
    </span>
  );
}
