"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PinIcon } from "@/components/icons/pin-icon";
import { SearchIcon } from "@/components/icons/search-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { chatListQuery } from "@/lib/utils/chat-filters";
import { cn } from "@/lib/utils/cn";
import type { ChatFilter, ChatSummary } from "@/types/conversation";
import { ChatFilters } from "./chat-filters";
import { ChatListHeader } from "./chat-list-header";
import { ChatListItem } from "./chat-list-item";
import { ChatSearch } from "./chat-search";

type ChatListProps = {
  chats: ChatSummary[];
  filter: ChatFilter;
  query: string;
  unreadCount: number;
  activeId: string | null;
};

export function ChatList({ chats, filter, query: initialQuery, unreadCount, activeId }: ChatListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [searching, startSearch] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const search = chatListQuery(filter, initialQuery);
  const grouped = filter === "all" && !initialQuery.trim();
  const pinned = grouped ? chats.filter((chat) => chat.pinned) : [];
  const rest = grouped ? chats.filter((chat) => !chat.pinned) : chats;

  function handleQuery(value: string) {
    setQuery(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startSearch(() => {
        router.replace(`${pathname}${chatListQuery(filter, value)}` as Route, { scroll: false });
      });
    }, 250);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 px-4 pt-4 pb-3 md:pt-5">
        <ChatListHeader filter={filter} pathname={pathname} query={initialQuery} />
        <ChatSearch value={query} onChange={handleQuery} />
        <ChatFilters pathname={pathname} active={filter} query={initialQuery} unreadCount={unreadCount} />
      </div>
      <div
        className={cn("min-h-0 flex-1 overflow-y-auto px-2 pb-4 transition-opacity duration-150", searching && "opacity-60")}
        aria-busy={searching}
      >
        {chats.length === 0 ? (
          <EmptyState
            icon={<SearchIcon size={22} />}
            title={initialQuery ? "No chats found" : filter === "archived" ? "Nothing archived" : "No chats yet"}
            description={
              initialQuery
                ? `Nothing matches “${initialQuery}”.`
                : filter === "all"
                  ? "Start a conversation from the new chat button."
                  : "No chats in this view yet."
            }
            className="py-12"
          />
        ) : (
          <>
            {pinned.length > 0 ? (
              <section aria-labelledby="pinned-heading">
                <h2
                  id="pinned-heading"
                  className="flex items-center gap-1.5 px-3 pt-1 pb-1.5 text-2xs font-semibold tracking-wider text-muted uppercase"
                >
                  <PinIcon size={13} />
                  Pinned
                </h2>
                <ul className="flex flex-col gap-0.5">
                  {pinned.map((chat) => (
                    <ChatListItem key={chat.id} chat={chat} active={chat.id === activeId} search={search} />
                  ))}
                </ul>
              </section>
            ) : null}
            <section aria-labelledby="all-heading" className={pinned.length > 0 ? "mt-3" : undefined}>
              <h2
                id="all-heading"
                className={
                  grouped && pinned.length > 0
                    ? "px-3 pt-1 pb-1.5 text-2xs font-semibold tracking-wider text-muted uppercase"
                    : "sr-only"
                }
              >
                {grouped ? "All messages" : `${chats.length} results`}
              </h2>
              <ul className="flex flex-col gap-0.5">
                {rest.map((chat) => (
                  <ChatListItem key={chat.id} chat={chat} active={chat.id === activeId} search={search} />
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
