"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { UserPlusIcon } from "@/components/icons/user-plus-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { loadContacts } from "@/lib/actions/chats";
import { addMembers } from "@/lib/actions/groups";
import type { PersonView } from "@/types/conversation";

type AddMembersDialogProps = {
  conversationId: string;
  existingIds: string[];
  onClose: () => void;
  onDone: (message: string, tone: "error" | "success") => void;
};

export function AddMembersDialog({ conversationId, existingIds, onClose, onDone }: AddMembersDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [contacts, setContacts] = useState<PersonView[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    dialogRef.current?.showModal();
    void loadContacts().then((result) => {
      if (result.ok) setContacts(result.data);
      else setError(result.error.message);
    });
  }, []);

  const needle = query.trim().toLowerCase();
  const visible = (contacts ?? []).filter(
    (person) =>
      !existingIds.includes(person.id) &&
      (!needle || person.name.toLowerCase().includes(needle) || person.username.includes(needle)),
  );

  function submit() {
    startTransition(async () => {
      const result = await addMembers({ conversationId, userIds: selected });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onDone(result.data.added === 1 ? "Member added" : `${result.data.added} members added`, "success");
      onClose();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-members-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-md overflow-hidden rounded-[24px] border border-line bg-card p-0 text-fg shadow-lg backdrop:bg-overlay backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[calc(100dvh-32px)] flex-col">
        <header className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="inline-grid size-10 place-items-center rounded-lg border border-accent-line bg-accent-soft text-accent-text">
            <UserPlusIcon size={18} />
          </span>
          <h2 id="add-members-title" className="flex-1 text-lg font-semibold tracking-tight">
            Add members
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <XIcon size={20} />
          </IconButton>
        </header>
        <div className="px-5 pt-4">
          <SearchInput
            label="Search contacts"
            placeholder="Search contacts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <ul aria-label="Contacts" className="mt-2 min-h-40 flex-1 overflow-y-auto px-3 pb-2">
          {contacts === null ? (
            <li className="flex justify-center py-8 text-muted">
              <Spinner />
            </li>
          ) : visible.length === 0 ? (
            <li className="px-2 py-8 text-center text-sm text-muted">Everyone you chat with is already here.</li>
          ) : (
            visible.map((person) => (
              <li key={person.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-surface">
                  <Avatar initials={person.initials} tone={person.tone} image={person.image} size="md" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-md font-medium">{person.name}</span>
                    <span className="truncate text-xs text-muted">@{person.username}</span>
                  </span>
                  <Checkbox
                    checked={selected.includes(person.id)}
                    onChange={() =>
                      setSelected((current) =>
                        current.includes(person.id) ? current.filter((id) => id !== person.id) : [...current, person.id],
                      )
                    }
                  />
                </label>
              </li>
            ))
          )}
        </ul>
        <footer className="flex flex-col gap-2 border-t border-line px-5 py-4">
          {error ? (
            <p className="text-xs text-danger-text" aria-live="polite">
              {error}
            </p>
          ) : null}
          <div className="flex items-center gap-3">
            <p className="mr-auto text-sm text-muted">{selected.length} selected</p>
            <Button variant="outline" shape="rounded" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button shape="rounded" onClick={submit} disabled={pending || selected.length === 0} aria-busy={pending}>
              {pending ? <Spinner /> : null}
              Add
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
