import { ChartColumnIcon } from "@/components/icons/chart-column-icon";
import { CheckIcon } from "@/components/icons/check-icon";
import { cn } from "@/lib/utils/cn";
import type { PollView } from "@/types/message";

type PollProps = {
  poll: PollView;
  onVote?: (optionId: string) => void;
  disabled?: boolean;
};

export function Poll({ poll, onVote, disabled = false }: PollProps) {
  const interactive = Boolean(onVote) && !poll.closed;
  return (
    <figure className="max-w-xl rounded-xl border border-line bg-card p-4 text-fg shadow-sm md:p-5">
      <figcaption className="flex items-center gap-2">
        <ChartColumnIcon size={18} className="shrink-0 text-accent-text" />
        <span className="text-md font-semibold">{poll.question}</span>
        <span className="ml-auto shrink-0 text-sm text-muted">
          {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
        </span>
      </figcaption>
      {poll.multipleChoice ? <p className="mt-1 text-xs text-muted">Select one or more</p> : null}
      <ul className="mt-4 flex flex-col gap-2">
        {poll.options.map((option) => {
          const content = (
            <>
              <span
                aria-hidden="true"
                className={cn("absolute inset-y-0 left-0 transition-[width] duration-300", option.voted ? "bg-accent-soft" : "bg-surface")}
                style={{ width: `${option.percent}%` }}
              />
              <span
                className={cn(
                  "relative inline-grid size-5 shrink-0 place-items-center",
                  poll.multipleChoice ? "rounded-[6px]" : "rounded-full",
                  option.voted ? "bg-accent-solid text-on-accent" : "border border-line-strong",
                )}
              >
                {option.voted ? <CheckIcon size={12} strokeWidth={2.5} /> : null}
              </span>
              <span className="relative min-w-0 flex-1 truncate text-left text-md">
                {option.label}
                {option.voted ? <span className="sr-only"> (your vote)</span> : null}
              </span>
              <span className={cn("relative text-md font-semibold tabular-nums", option.voted && "text-accent-text")}>
                {option.percent}%
              </span>
            </>
          );
          const classes = cn(
            "relative flex h-11 w-full items-center gap-3 overflow-hidden rounded-md border px-3",
            option.voted ? "border-accent-line" : "border-line",
          );
          return (
            <li key={option.id}>
              {interactive ? (
                <button
                  type="button"
                  aria-pressed={option.voted}
                  disabled={disabled}
                  onClick={() => onVote?.(option.id)}
                  className={cn(classes, "transition-colors duration-150 hover:border-accent-line disabled:opacity-70")}
                >
                  {content}
                </button>
              ) : (
                <div className={classes}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
