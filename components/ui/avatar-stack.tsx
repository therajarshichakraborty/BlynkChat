import { cn } from "@/lib/utils/cn";
import type { Tone } from "@/types/tone";
import { Avatar } from "./avatar";

type StackPerson = {
  initials: string;
  tone: Tone;
};

type AvatarStackProps = {
  people: StackPerson[];
  size?: "xs" | "sm" | "md" | "lg";
  extra?: string;
  className?: string;
};

export function AvatarStack({ people, size = "sm", extra, className }: AvatarStackProps) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-hidden="true">
      {people.map((person, index) => (
        <Avatar
          key={`${person.initials}-${index}`}
          initials={person.initials}
          tone={person.tone}
          size={size}
          ring
          className={index === 0 ? undefined : "-ml-2"}
        />
      ))}
      {extra ? <span className="ml-1.5 text-xs font-medium text-muted">{extra}</span> : null}
    </span>
  );
}
