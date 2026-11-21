"use client";

import Link from "next/link";
import { BellOffIcon } from "@/components/icons/bell-off-icon";
import { PinIcon } from "@/components/icons/pin-icon";
import { useTimeZone } from "@/components/shell/time-zone";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { withSearch } from "@/lib/utils/chat-filters";
import { cn } from "@/lib/utils/cn";
import { listTimestamp } from "@/lib/utils/time";
import type { ChatSummary } from "@/types/conversation";
import { ChatPreviewLine } from "./chat-preview-line";

type ChatListItemProps = {
  chat: ChatSummary;
  active: boolean;
  search: string;
  typingLabel?: string;
};

export function ChatListItem({ chat, active, search, typingLabel }: ChatListItemProps) {
  const timeZone = useTimeZone();
  const highlighted = chat.unread > 0 && !chat.muted;

  return (
    <li>
      <Link
        href={withSearch(chat.href, search)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-150",
          active ? "border-line bg-card shadow-sm" : "border-transparent hover:bg-raised/70",
        )}
      >
        <Avatar initials={chat.initials} tone={chat.tone} image={chat.image} size="lg" online={chat.online} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-md font-medium">{chat.title}</span>
            {chat.muted ? (
              <BellOffIcon size={14} className="shrink-0 text-muted" aria-hidden={false} role="img" aria-label="Muted" />
            ) : null}
            <time
              dateTime={chat.lastActivityAt}
              className={cn(
                "ml-auto shrink-0 text-xs tabular-nums",
                highlighted ? "font-medium text-accent-text" : "text-muted",
              )}
            >
              {listTimestamp(chat.lastActivityAt, timeZone)}
            </time>
          </span>
          <span className="flex items-center gap-2 text-base">
            <ChatPreviewLine chat={chat} typingLabel={typingLabel} />
            <span className="ml-auto shrink-0">
              {chat.unread > 0 ? (
                <Badge count={chat.unread} tone={chat.muted ? "muted" : "accent"} label="unread messages" />
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
