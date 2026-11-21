import { getChatList, getUnreadTotal } from "@/lib/data/chats";
import { parseChatFilter } from "@/lib/utils/chat-filters";
import { ChatList } from "./chat-list";

type ChatListPaneProps = {
  userId: string;
  filter?: string;
  query?: string;
  activeId: string | null;
};

export async function ChatListPane({ userId, filter: rawFilter, query = "", activeId }: ChatListPaneProps) {
  const filter = parseChatFilter(rawFilter);
  const [chats, unreadCount] = await Promise.all([
    getChatList(userId, filter, query),
    getUnreadTotal(userId),
  ]);

  return (
    <ChatList
      key={`${filter}:${query}`}
      chats={chats}
      filter={filter}
      query={query}
      unreadCount={unreadCount}
      activeId={activeId}
      meId={userId}
    />
  );
}
