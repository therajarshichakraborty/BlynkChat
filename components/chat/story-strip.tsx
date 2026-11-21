import { PlusIcon } from "@/components/icons/plus-icon";
import { Avatar } from "@/components/ui/avatar";
import type { User } from "@/types/user";

type StoryStripProps = {
  me: User;
  people: User[];
};

export function StoryStrip({ me, people }: StoryStripProps) {
  return (
    <section aria-label="Stories" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:hidden">
      <ul className="flex gap-4">
        <li className="flex w-16 shrink-0 flex-col items-center gap-1.5">
          <span className="relative rounded-full p-0.5 ring-2 ring-line">
            <Avatar initials={me.initials} tone={me.tone} size="xl" />
            <span className="absolute right-0 bottom-0 inline-grid size-5 place-items-center rounded-full bg-accent-solid text-on-accent ring-2 ring-bg">
              <PlusIcon size={12} strokeWidth={2.5} />
            </span>
          </span>
          <span className="text-xs">Your story</span>
        </li>
        {people.map((person) => (
          <li key={person.id} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
            <span className="rounded-full p-0.5 ring-2 ring-accent">
              <Avatar initials={person.initials} tone={person.tone} size="xl" label={`${person.firstName}'s story`} />
            </span>
            <span className="max-w-full truncate text-xs">{person.firstName}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
