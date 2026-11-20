import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { fieldShellClasses } from "./text-field";

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
  id: string;
  label: string;
};

export function TextAreaField({ id, label, className, ...props }: TextAreaFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-fg">
        {label}
      </label>
      <div className={fieldShellClasses(false, "py-2.5")}>
        <textarea
          id={id}
          rows={3}
          className="min-h-18 w-full resize-none bg-transparent text-md leading-relaxed outline-none"
          {...props}
        />
      </div>
    </div>
  );
}
