import Link from "next/link";
import { BellOffIcon } from "@/components/icons/bell-off-icon";
import { PinIcon } from "@/components/icons/pin-icon";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { chatHref } from "@/lib/utils/chat-filters";
import { cn } from "@/lib/utils/cn";
import type { Chat } from "@/types/chat";
import { ChatPreviewLine } from "./chat-preview-line";

type ChatListItemProps = {
  chat: Chat;
  active: boolean;
  search: string;
};

export function ChatListItem({ chat, active, search }: ChatListItemProps) {
  const highlighted = chat.unread > 0 && !chat.muted;

  return (
    <li>
      <Link
        href={chatHref(chat.id, search)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-150",
          active
            ? "border-line bg-card shadow-sm"
            : "border-transparent hover:bg-raised/70",
        )}
      >
        <Avatar initials={chat.initials} tone={chat.tone} size="lg" online={chat.online} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-md font-medium">{chat.title}</span>
            {chat.muted ? <BellOffIcon size={14} className="shrink-0 text-muted" aria-hidden={false} role="img" aria-label="Muted" /> : null}
            <span
              className={cn(
                "ml-auto shrink-0 text-xs tabular-nums",
                highlighted ? "font-medium text-accent-text" : "text-muted",
              )}
            >
              {chat.lastAt}
            </span>
          </span>
          <span className="flex items-center gap-2 text-base">
            <ChatPreviewLine chat={chat} />
            <span className="ml-auto shrink-0">
              {highlighted ? (
                <Badge count={chat.unread} label="unread messages" />
              ) : chat.pinned ? (
                <PinIcon size={14} className="text-muted" aria-hidden={false} role="img" aria-label="Pinned" />
              ) : null}
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}
