import { GlobeIcon } from "@/components/icons/globe-icon";
import { LockIcon } from "@/components/icons/lock-icon";
import { cn } from "@/lib/utils/cn";

export type GroupVisibility = "private" | "public";

type GroupPrivacyStepProps = {
  visibility: GroupVisibility;
  onChange: (value: GroupVisibility) => void;
  summary: string;
};

const options = [
  {
    value: "private",
    title: "Private group",
    description: "Only people you invite can find and join. Best for teams and close friends.",
    icon: LockIcon,
  },
  {
    value: "public",
    title: "Public group",
    description: "Anyone with the link can request to join. Great for clubs and open projects.",
    icon: GlobeIcon,
  },
] as const;

export function GroupPrivacyStep({ visibility, onChange, summary }: GroupPrivacyStepProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-md font-medium">Who can join?</legend>
      {options.map(({ value, title, description, icon: OptionIcon }) => {
        const checked = visibility === value;
        return (
          <label
            key={value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors duration-150 has-focus-visible:ring-4 has-focus-visible:ring-ring",
              checked ? "border-accent bg-accent-soft" : "border-line hover:bg-surface",
            )}
          >
            <input
              type="radio"
              name="group-visibility"
              value={value}
              checked={checked}
              onChange={() => onChange(value)}
              className="sr-only"
            />
            <span
              className={cn(
                "inline-grid size-10 shrink-0 place-items-center rounded-md",
                checked ? "bg-accent-solid text-on-accent" : "bg-raised text-muted",
              )}
            >
              <OptionIcon size={18} />
            </span>
            <span className="flex flex-col">
              <span className="text-md font-medium">{title}</span>
              <span className="text-sm text-muted">{description}</span>
            </span>
          </label>
        );
      })}
      <p className="mt-2 rounded-md bg-surface px-4 py-3 text-sm text-muted">{summary}</p>
    </fieldset>
  );
}
