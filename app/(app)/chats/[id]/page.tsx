import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChatHeader } from "@/components/chat/chat-header";
import { Conversation } from "@/components/chat/conversation";
import { ProfilePanel } from "@/components/chat/profile-panel";
import { SidePanel, SidePanelProvider, SidePanelToggle } from "@/components/shell/side-panel";
import { getChat, getChatIds, getChatThread } from "@/lib/data/chats";
import { getCurrentUser } from "@/lib/data/users";
import type { ChatThread } from "@/types/chat";

type ChatPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getChatIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { id } = await params;
  const chat = getChat(id);
  return chat
    ? { title: chat.title, description: `Your conversation with ${chat.title} on Relay.` }
    : { title: "Chat not found" };
}

function subtitleFor({ chat, peer }: ChatThread) {
  if (chat.typing) return "typing…";
  if (chat.memberCount) return chat.memberCount;
  if (peer?.online) return "online";
  return peer ? `${peer.title} · last seen recently` : "";
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const thread = getChatThread(id);
  if (!thread) notFound();

  const me = getCurrentUser();
  const { chat, peer } = thread;
  const panelLabel = chat.kind === "direct" ? "contact info" : "group info";

  return (
    <SidePanelProvider>
      <main id="main" className="flex min-w-0 flex-1">
        <section aria-label={`Conversation with ${chat.title}`} className="flex min-w-0 flex-1 flex-col">
          <ChatHeader chat={chat} subtitle={subtitleFor(thread)}>
            <SidePanelToggle label={panelLabel} />
          </ChatHeader>
          <Conversation
            key={chat.id}
            chatId={chat.id}
            currentUserId={me.id}
            initialMessages={thread.messages}
            people={{ ...thread.people, [me.id]: me }}
            group={chat.kind !== "direct"}
            typing={chat.typing ? peer : undefined}
            placeholder={`Message ${chat.kind === "direct" && peer ? peer.firstName : chat.title}…`}
          />
        </section>
        <SidePanel label={panelLabel}>
          <ProfilePanel thread={thread} />
        </SidePanel>
      </main>
    </SidePanelProvider>
  );
}
