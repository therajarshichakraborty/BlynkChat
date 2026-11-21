import { XIcon } from "@/components/icons/x-icon";
import { Avatar } from "@/components/ui/avatar";
import { firstName } from "@/lib/utils/messages";
import type { PersonView } from "@/types/conversation";

type MemberChipProps = {
  user: PersonView;
  onRemove: () => void;
};

export function MemberChip({ user, onRemove }: MemberChipProps) {
  return (
    <li className="inline-flex h-9 items-center gap-2 rounded-full border border-accent-line bg-accent-soft pr-1 pl-1">
      <Avatar initials={user.initials} tone={user.tone} image={user.image} size="sm" />
      <span className="text-md">{firstName(user.name)}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${firstName(user.name)}`}
        className="inline-grid size-7 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-raised hover:text-fg"
      >
        <XIcon size={15} />
      </button>
    </li>
  );
}
