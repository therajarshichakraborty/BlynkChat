import { XIcon } from "@/components/icons/x-icon";
import { Avatar } from "@/components/ui/avatar";
import type { User } from "@/types/user";

type MemberChipProps = {
  user: User;
  onRemove: () => void;
};

export function MemberChip({ user, onRemove }: MemberChipProps) {
  return (
    <li className="inline-flex h-9 items-center gap-2 rounded-full border border-accent-line bg-accent-soft pr-1 pl-1">
      <Avatar initials={user.initials} tone={user.tone} size="sm" />
      <span className="text-md">{user.firstName}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${user.firstName}`}
        className="inline-grid size-7 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-raised hover:text-fg"
      >
        <XIcon size={15} />
      </button>
    </li>
  );
}
