import type { Metadata } from "next";
import { MessageCircleIcon } from "@/components/icons/message-circle-icon";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Chats",
  description: "Your conversations, groups and rooms.",
};

export default function ChatsPage() {
  return (
    <main id="main" className="grid flex-1 place-items-center">
      <EmptyState
        icon={<MessageCircleIcon size={24} />}
        title="Pick a conversation"
        description="Choose a chat from the list or start a new one. Messages are end-to-end encrypted."
      />
    </main>
  );
}
