import type { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { HashIcon } from "@/components/icons/hash-icon";
import { MessageSquareTextIcon } from "@/components/icons/message-square-text-icon";
import { PinIcon } from "@/components/icons/pin-icon";
import { SearchIcon } from "@/components/icons/search-icon";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { IconButton } from "@/components/ui/icon-button";
import { IconLink } from "@/components/ui/icon-link";
import type { AvatarPerson } from "@/types/user";

type RoomHeaderProps = {
  name: string;
  topic: string;
  onlineLabel: string;
  sample: AvatarPerson[];
  extra?: string;
  children?: ReactNode;
};

export function RoomHeader({ name, topic, onlineLabel, sample, extra, children }: RoomHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-line bg-bg/80 px-2 backdrop-blur-xl md:h-18 md:gap-3 md:px-6">
      <IconLink href="/communities" label="Back to communities" className="md:hidden">
        <ChevronLeftIcon size={22} />
      </IconLink>
      <span className="inline-grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-surface max-sm:hidden">
        <HashIcon size={20} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-md font-semibold md:text-lg">
          <span className="sm:sr-only">#</span>
          {name}
        </h1>
        <p className="truncate text-sm text-muted">
          {topic} · {onlineLabel}
        </p>
      </div>
      <AvatarStack people={sample} size="sm" extra={extra} className="max-lg:hidden" />
      <IconButton label="Pinned messages" className="max-md:hidden">
        <PinIcon size={20} />
      </IconButton>
      <IconButton label="Threads" className="max-md:hidden">
        <MessageSquareTextIcon size={20} />
      </IconButton>
      <IconButton label={`Search #${name}`}>
        <SearchIcon size={20} />
      </IconButton>
      {children}
    </header>
  );
}
