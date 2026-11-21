import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { LockIcon } from "@/components/icons/lock-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { SearchIcon } from "@/components/icons/search-icon";
import { VideoIcon } from "@/components/icons/video-icon";
import { IconButton } from "@/components/ui/icon-button";
import { IconLink } from "@/components/ui/icon-link";
import { Tag } from "@/components/ui/tag";
import type { ConversationView } from "@/types/conversation";
import { ChatHeaderAvatar, ChatSubtitle } from "./chat-subtitle";

type ChatHeaderProps = {
  conversation: ConversationView;
  actions?: ReactNode;
  children?: ReactNode;
};

export function ChatHeader({ conversation, actions, children }: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-line bg-bg/80 px-2 backdrop-blur-xl md:h-18 md:gap-3 md:px-6">
      <IconLink href="/chats" label="Back to chats" className="md:hidden">
        <ChevronLeftIcon size={22} />
      </IconLink>
      <ChatHeaderAvatar />
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-md font-semibold md:text-lg">{conversation.title}</h1>
        <ChatSubtitle />
      </div>
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-muted max-lg:hidden">
        <LockIcon size={15} />
        End-to-end encrypted
      </span>
      {actions ?? (
        <IconButton label="Search in conversation" className="max-md:hidden">
          <SearchIcon size={20} />
        </IconButton>
      )}
      <IconButton label="Audio calls are coming soon" aria-disabled="true">
        <PhoneIcon size={20} />
      </IconButton>
      <Link
        href="/video"
        title="Video calls are coming soon"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line pr-1.5 pl-3 text-muted transition-colors duration-150 hover:bg-surface"
      >
        <VideoIcon size={19} />
        <span className="sr-only">Video calls, coming soon</span>
        <Tag aria-hidden="true">Soon</Tag>
      </Link>
      {children}
    </header>
  );
}
