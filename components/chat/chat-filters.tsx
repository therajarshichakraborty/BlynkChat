import type { Route } from "next";
import { ChipLink } from "@/components/ui/chip-link";
import { chatFilters, chatListQuery } from "@/lib/utils/chat-filters";
import type { ChatFilter } from "@/types/conversation";

type ChatFiltersProps = {
  pathname: string;
  active: ChatFilter;
  query: string;
  unreadCount: number;
};

export function ChatFilters({ pathname, active, query, unreadCount }: ChatFiltersProps) {
  return (
    <nav aria-label="Filter chats" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
      <ul className="flex gap-2">
        {chatFilters.map((filter) => (
          <li key={filter.value}>
            <ChipLink
              href={`${pathname}${chatListQuery(filter.value, query)}` as Route}
              active={filter.value === active}
              count={filter.value === "unread" ? unreadCount : undefined}
            >
              {filter.label}
            </ChipLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
