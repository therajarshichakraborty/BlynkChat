import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchInput } from "@/components/ui/search-input";
import { Tag } from "@/components/ui/tag";
import type { User } from "@/types/user";
import { MemberChip } from "./member-chip";

type GroupMembersStepProps = {
  contacts: User[];
  selected: string[];
  error?: string;
  onToggle: (id: string) => void;
};

export function GroupMembersStep({ contacts, selected, error, onToggle }: GroupMembersStepProps) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = contacts.filter((user) => !needle || user.name.toLowerCase().includes(needle));
  const chosen = contacts.filter((user) => selected.includes(user.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-medium">Add members</h3>
        <Tag>{selected.length} selected</Tag>
      </div>
      {chosen.length > 0 ? (
        <ul aria-label="Selected members" className="flex flex-wrap gap-2">
          {chosen.map((user) => (
            <MemberChip key={user.id} user={user} onRemove={() => onToggle(user.id)} />
          ))}
        </ul>
      ) : null}
      <SearchInput
        label="Search contacts"
        placeholder="Search contacts"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {error ? (
        <p className="text-xs text-danger-text" aria-live="polite">
          {error}
        </p>
      ) : null}
      <ul aria-label="Contacts" className="-mx-2 flex max-h-80 flex-col overflow-y-auto">
        {visible.map((user) => (
          <li key={user.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-surface">
              <Avatar initials={user.initials} tone={user.tone} size="lg" online={user.online} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-md font-medium">{user.name}</span>
                <span className="truncate text-sm text-muted">{user.title}</span>
              </span>
              <Checkbox checked={selected.includes(user.id)} onChange={() => onToggle(user.id)} />
            </label>
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="px-2 py-6 text-center text-sm text-muted">No contacts match “{query}”.</li>
        ) : null}
      </ul>
    </div>
  );
}
