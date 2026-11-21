import type { Route } from "next";
import type { ChatFilter } from "@/types/conversation";

export const chatFilters: { value: ChatFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "groups", label: "Groups" },
  { value: "rooms", label: "Rooms" },
  { value: "archived", label: "Archived" },
];

export function parseChatFilter(value: string | null | undefined): ChatFilter {
  return chatFilters.find((filter) => filter.value === value)?.value ?? "all";
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

export function withSearch(href: string, search: string): Route {
  return `${href}${href.startsWith("/chats/") ? search : ""}` as Route;
}
