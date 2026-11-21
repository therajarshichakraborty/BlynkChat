import type { Route } from "next";
import { FilterIcon } from "@/components/icons/filter-icon";
import { IconLink } from "@/components/ui/icon-link";
import { chatListQuery } from "@/lib/utils/chat-filters";
import { cn } from "@/lib/utils/cn";
import type { ChatFilter } from "@/types/chat";

type ChatListHeaderProps = {
  filter: ChatFilter;
  pathname: string;
  query: string;
};

export function ChatListHeader({ filter, pathname, query }: ChatListHeaderProps) {
  const unreadOnly = filter === "unread";

  return (
    <div className="flex items-center gap-1">
      <h1 className="text-3xl font-semibold md:text-2xl">Chats</h1>
      <IconLink
        href={`${pathname}${chatListQuery(unreadOnly ? "all" : "unread", query)}` as Route}
        label={unreadOnly ? "Show all chats" : "Show unread only"}
        className={cn("ml-auto", unreadOnly && "bg-accent-soft text-accent-text")}
      >
        <FilterIcon size={19} />
      </IconLink>
    </div>
  );
}
