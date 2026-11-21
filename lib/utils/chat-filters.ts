import type { Route } from "next";
import type { Chat, ChatFilter } from "@/types/chat";

export const chatFilters: { value: ChatFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "groups", label: "Groups" },
  { value: "rooms", label: "Rooms" },
  { value: "starred", label: "Starred" },
];

export function parseChatFilter(value: string | null): ChatFilter {
  return chatFilters.some((filter) => filter.value === value) ? (value as ChatFilter) : "all";
}

function matchesFilter(chat: Chat, filter: ChatFilter) {
  switch (filter) {
    case "unread":
      return chat.unread > 0;
    case "groups":
      return chat.kind === "group";
    case "rooms":
      return chat.kind === "room";
    case "starred":
      return chat.starred;
    default:
      return true;
  }
}

export function filterChats(chats: Chat[], filter: ChatFilter, query: string) {
  const needle = query.trim().toLowerCase();
  return chats.filter(
    (chat) => matchesFilter(chat, filter) && (!needle || chat.title.toLowerCase().includes(needle)),
  );
}

export function chatListQuery(filter: ChatFilter, query: string) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (query.trim()) params.set("q", query.trim());
  const search = params.toString();
  return search ? `?${search}` : "";
}

export function chatHref(id: string, search = ""): Route {
  return `/chats/${id}${search}` as Route;
}
