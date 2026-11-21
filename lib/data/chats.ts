import { chats } from "@/lib/mock/chats";
import type { Chat } from "@/types/chat";

export function getChats(): Chat[] {
  return chats;
}

export function getUnreadTotal(): number {
  return chats.reduce((total, chat) => total + (chat.muted ? 0 : chat.unread), 0);
}
