import { chats, commonGroupIds, sharedItems, sharedMedia } from "@/lib/mock/chats";
import { messages } from "@/lib/mock/messages";
import type { Chat, ChatThread } from "@/types/chat";
import type { User } from "@/types/user";
import { getUser } from "./users";

export function getChats(): Chat[] {
  return chats;
}

export function getChatIds(): string[] {
  return chats.map((chat) => chat.id);
}

export function getChat(id: string): Chat | undefined {
  return chats.find((chat) => chat.id === id);
}

export function getUnreadTotal(): number {
  return chats.reduce((total, chat) => total + (chat.muted ? 0 : chat.unread), 0);
}

export function getChatThread(id: string): ChatThread | undefined {
  const chat = getChat(id);
  if (!chat) return undefined;

  const thread = messages.filter((message) => message.chatId === id);
  const people: Record<string, User> = {};
  for (const message of thread) {
    const author = getUser(message.authorId);
    if (author) people[author.id] = author;
  }

  return {
    chat,
    peer: chat.peerId ? getUser(chat.peerId) : undefined,
    people,
    messages: thread,
    media: sharedMedia,
    mediaCount: 248,
    shared: sharedItems,
    commonGroups: chats.filter((item) => commonGroupIds.includes(item.id) && item.id !== id),
  };
}
