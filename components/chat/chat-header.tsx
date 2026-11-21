import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { LockIcon } from "@/components/icons/lock-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { SearchIcon } from "@/components/icons/search-icon";
import { VideoIcon } from "@/components/icons/video-icon";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { IconLink } from "@/components/ui/icon-link";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils/cn";
import type { Chat } from "@/types/chat";

type ChatHeaderProps = {
  chat: Chat;
  subtitle: string;
  children?: ReactNode;
};

export function ChatHeader({ chat, subtitle, children }: ChatHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-line bg-bg/80 px-2 backdrop-blur-xl md:h-18 md:gap-3 md:px-6">
      <IconLink href="/chats" label="Back to chats" className="md:hidden">
        <ChevronLeftIcon size={22} />
      </IconLink>
      <Avatar initials={chat.initials} tone={chat.tone} size="lg" online={chat.online} />
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-md font-semibold md:text-lg">{chat.title}</h1>
        <p className={cn("truncate text-sm", chat.typing ? "font-medium text-accent-text" : "text-muted")}>
          {subtitle}
        </p>
      </div>
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-sm text-muted max-lg:hidden">
        <LockIcon size={15} />
        End-to-end encrypted
      </span>
      <IconButton label="Search in conversation" className="max-md:hidden">
        <SearchIcon size={20} />
      </IconButton>
      <IconButton label="Start audio call">
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
