import { Suspense, type ReactNode } from "react";
import { ChatList } from "@/components/chat/chat-list";
import { ChatListSkeleton } from "@/components/chat/chat-list-skeleton";
import { SplitView } from "@/components/shell/split-view";
import { getChats, getUnreadTotal } from "@/lib/data/chats";

export default function ChatsLayout({ children }: { children: ReactNode }) {
  return (
    <SplitView
      listLabel="Chat list"
      list={
        <Suspense fallback={<ChatListSkeleton />}>
          <ChatList chats={getChats()} unreadCount={getUnreadTotal()} />
        </Suspense>
      }
    >
      {children}
    </SplitView>
  );
}
