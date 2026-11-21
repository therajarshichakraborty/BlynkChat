import { ChartColumnIcon } from "@/components/icons/chart-column-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { cn } from "@/lib/utils/cn";
import type { Poll as PollData } from "@/types/community";

type PollProps = {
  poll: PollData;
};

export function Poll({ poll }: PollProps) {
  return (
    <figure className="max-w-xl rounded-xl border border-line bg-card p-4 shadow-sm md:p-5">
      <figcaption className="flex items-center gap-2">
        <ChartColumnIcon size={18} className="text-accent-text" />
        <span className="text-md font-semibold">{poll.title}</span>
        <span className="ml-auto text-sm text-muted">{poll.votes} votes</span>
      </figcaption>
      <ul className="mt-4 flex flex-col gap-2">
        {poll.options.map((option) => (
          <li
            key={option.label}
            className={cn(
              "relative flex h-11 items-center gap-3 overflow-hidden rounded-md border px-3",
              option.voted ? "border-accent-line" : "border-line",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("absolute inset-y-0 left-0", option.voted ? "bg-accent-soft" : "bg-surface")}
              style={{ width: `${option.percent}%` }}
            />
            <span
              className={cn(
                "relative inline-grid size-5 shrink-0 place-items-center rounded-full",
                option.voted ? "bg-accent-solid text-on-accent" : "border border-line-strong",
              )}
            >
              {option.voted ? <CheckIcon size={12} strokeWidth={2.5} /> : null}
            </span>
            <span className="relative min-w-0 flex-1 truncate text-md">
              {option.label}
              {option.voted ? <span className="sr-only"> (your vote)</span> : null}
            </span>
            <span
              className={cn(
                "relative text-md font-semibold tabular-nums",
                option.voted && "text-accent-text",
              )}
            >
              {option.percent}%
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
