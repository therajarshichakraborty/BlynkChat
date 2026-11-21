"use client";

import type { Route } from "next";
import {
  usePathname,
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";
import { useState } from "react";
import { PinIcon } from "@/components/icons/pin-icon";
import { SearchIcon } from "@/components/icons/search-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { chatListQuery, filterChats, parseChatFilter } from "@/lib/utils/chat-filters";
import type { Chat } from "@/types/chat";
import { ChatFilters } from "./chat-filters";
import { ChatListHeader } from "./chat-list-header";
import { ChatListItem } from "./chat-list-item";
import { ChatSearch } from "./chat-search";

type ChatListProps = {
  chats: Chat[];
  unreadCount: number;
};

export function ChatList({ chats, unreadCount }: ChatListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeId = useSelectedLayoutSegment();
  const filter = parseChatFilter(searchParams.get("filter"));
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const search = chatListQuery(filter, query);
  const visible = filterChats(chats, filter, query);
  const grouped = filter === "all" && !query.trim();
  const pinned = grouped ? visible.filter((chat) => chat.pinned) : [];
  const rest = grouped ? visible.filter((chat) => !chat.pinned) : visible;

  function handleQuery(value: string) {
    setQuery(value);
    router.replace(`${pathname}${chatListQuery(filter, value)}` as Route, { scroll: false });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-3 px-4 pt-4 pb-3 md:pt-5">
        <ChatListHeader filter={filter} pathname={pathname} query={query} />
        <ChatSearch value={query} onChange={handleQuery} />
        <ChatFilters pathname={pathname} active={filter} query={query} unreadCount={unreadCount} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={<SearchIcon size={22} />}
            title="No chats found"
            description={query ? `Nothing matches “${query}”.` : "No chats in this view yet."}
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
                  grouped
                    ? "px-3 pt-1 pb-1.5 text-2xs font-semibold tracking-wider text-muted uppercase"
                    : "sr-only"
                }
              >
                {grouped ? "All messages" : `${visible.length} results`}
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
