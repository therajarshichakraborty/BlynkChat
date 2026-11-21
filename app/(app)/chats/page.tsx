import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatListPane } from "@/components/chat/chat-list-pane";
import { ChatListSkeleton } from "@/components/chat/chat-list-skeleton";
import { MessageCircleIcon } from "@/components/icons/message-circle-icon";
import { SplitView } from "@/components/shell/split-view";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "Chats",
  description: "Your conversations, groups and rooms.",
};

type ChatsPageProps = {
  searchParams: Promise<{ filter?: string; q?: string }>;
};

export default async function ChatsPage({ searchParams }: ChatsPageProps) {
  const user = await requireUser();
  const { filter, q } = await searchParams;

  return (
    <SplitView
      open={false}
      listLabel="Chat list"
      list={
        <Suspense fallback={<ChatListSkeleton />}>
          <ChatListPane userId={user.id} filter={filter} query={q} activeId={null} />
        </Suspense>
      }
    >
      <main id="main" className="grid flex-1 place-items-center">
        <EmptyState
          icon={<MessageCircleIcon size={24} />}
          title="Pick a conversation"
          description="Choose a chat from the list or start a new one. Messages are end-to-end encrypted."
        />
      </main>
    </SplitView>
  );
}
