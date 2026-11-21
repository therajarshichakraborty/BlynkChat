"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ForwardIcon } from "@/components/icons/forward-icon";
import { XIcon } from "@/components/icons/x-icon";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { SearchInput } from "@/components/ui/search-input";
import { Spinner } from "@/components/ui/spinner";
import { loadChatList } from "@/lib/actions/chats";
import { forwardMessage } from "@/lib/actions/reactions";
import type { ChatSummary } from "@/types/conversation";

type ForwardDialogProps = {
  messageId: string;
  onClose: () => void;
  onDone: (message: string, tone: "error" | "success") => void;
};

const maxTargets = 5;

export function ForwardDialog({ messageId, onClose, onDone }: ForwardDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [chats, setChats] = useState<ChatSummary[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void loadChatList({ filter: "all", query }).then((result) => {
        if (!active) return;
        if (result.ok) setChats(result.data.chats);
        else setError(result.error.message);
      });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  function toggle(id: string) {
    setError("");
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= maxTargets) {
        setError(`You can forward to up to ${maxTargets} chats at a time.`);
        return current;
      }
      return [...current, id];
    });
  }

  function submit() {
    startTransition(async () => {
      const result = await forwardMessage({ messageId, conversationIds: selected });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onDone(result.data.count === 1 ? "Message forwarded" : `Forwarded to ${result.data.count} chats`, "success");
      onClose();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="forward-title"
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
            <ForwardIcon size={18} />
          </span>
          <h2 id="forward-title" className="flex-1 text-lg font-semibold tracking-tight">
            Forward message
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <XIcon size={20} />
          </IconButton>
        </header>
        <div className="px-5 pt-4">
          <SearchInput
            label="Search chats"
            placeholder="Search chats"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <ul aria-label="Chats" className="mt-2 min-h-40 flex-1 overflow-y-auto px-3 pb-2">
          {chats === null ? (
            <li className="flex justify-center py-8 text-muted">
              <Spinner />
            </li>
          ) : chats.length === 0 ? (
            <li className="px-2 py-8 text-center text-sm text-muted">No chats match “{query}”.</li>
          ) : (
            chats.map((chat) => (
              <li key={chat.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-surface">
                  <Avatar initials={chat.initials} tone={chat.tone} size="md" />
                  <span className="min-w-0 flex-1 truncate text-md font-medium">{chat.title}</span>
                  <Checkbox checked={selected.includes(chat.id)} onChange={() => toggle(chat.id)} />
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
              {pending ? <Spinner /> : <ForwardIcon size={16} />}
              Forward
            </Button>
          </div>
        </footer>
      </div>
    </dialog>
  );
}
