import { Fragment } from "react";
import { CheckIcon } from "@/components/icons/check-icon";
import { cn } from "@/lib/utils/cn";

type StepperProps = {
  steps: string[];
  current: number;
  className?: string;
};

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn("flex items-center gap-3", className)} aria-label="Progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <Fragment key={step}>
            {index > 0 ? (
              <li
                aria-hidden="true"
                className={cn(
                  "h-px min-w-4 flex-1 transition-colors duration-200",
                  index <= current ? "bg-accent" : "bg-line",
                )}
              />
            ) : null}
            <li
              className="flex shrink-0 items-center gap-2.5"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "inline-grid size-6 place-items-center rounded-full text-xs font-semibold transition-colors duration-200",
                  done && "bg-accent-solid text-on-accent",
                  active && "border-[1.5px] border-accent text-accent-text",
                  !done && !active && "border border-line-strong text-muted",
                )}
              >
                {done ? <CheckIcon size={14} strokeWidth={2.5} /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-md font-medium max-sm:sr-only",
                  done || active ? "text-fg" : "text-muted",
                )}
              >
                {step}
                {done ? <span className="sr-only"> (completed)</span> : null}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
