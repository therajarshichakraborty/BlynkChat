import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatListPane } from "@/components/chat/chat-list-pane";
import { ChatListSkeleton } from "@/components/chat/chat-list-skeleton";
import { ChatView } from "@/components/chat/chat-view";
import { ConversationSkeleton } from "@/components/chat/conversation-skeleton";
import { SplitView } from "@/components/shell/split-view";
import { getConversation } from "@/lib/data/chats";
import { requireUser } from "@/lib/server/session";

type ChatPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string; q?: string }>;
};

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const user = await requireUser();
  const { id } = await params;
  const conversation = await getConversation(user.id, id);
  return conversation
    ? { title: conversation.title, description: `Your conversation with ${conversation.title} on Relay.` }
    : { title: "Chat not found" };
}

export default async function ChatPage({ params, searchParams }: ChatPageProps) {
  const user = await requireUser();
  const [{ id }, { filter, q }] = await Promise.all([params, searchParams]);

  return (
    <SplitView
      open
      listLabel="Chat list"
      list={
        <Suspense fallback={<ChatListSkeleton />}>
          <ChatListPane userId={user.id} filter={filter} query={q} activeId={id} />
        </Suspense>
      }
    >
      <Suspense key={id} fallback={<ConversationSkeleton />}>
        <ChatView userId={user.id} conversationId={id} />
      </Suspense>
    </SplitView>
  );
}
