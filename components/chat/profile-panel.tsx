import Link from "next/link";
import { BellIcon } from "@/components/icons/bell-icon";
import { FileTextIcon } from "@/components/icons/file-text-icon";
import { LinkIcon } from "@/components/icons/link-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { VideoIcon } from "@/components/icons/video-icon";
import { Avatar } from "@/components/ui/avatar";
import { chatHref } from "@/lib/utils/chat-filters";
import { cn } from "@/lib/utils/cn";
import { toneGradient } from "@/lib/utils/tone";
import type { ChatThread } from "@/types/chat";
import { ProfileAction } from "./profile-action";

type ProfilePanelProps = {
  thread: ChatThread;
};

export function ProfilePanel({ thread }: ProfilePanelProps) {
  const { chat, peer } = thread;
  const subtitle = peer ? `${peer.title} · ${peer.location}` : chat.memberCount;

  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
        <Avatar initials={chat.initials} tone={chat.tone} size="2xl" online={chat.online} />
        <h2 className="mt-4 text-xl font-semibold tracking-tight">{chat.title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
        <ul className="mt-6 flex w-full gap-2.5">
          <ProfileAction icon={<PhoneIcon size={19} />} label="Audio" />
          <ProfileAction icon={<VideoIcon size={19} />} label="Video" soon />
          <ProfileAction icon={<BellIcon size={19} />} label="Mute" />
        </ul>
      </section>
      <section aria-labelledby="media-heading" className="border-t border-line px-6 py-6">
        <div className="flex items-center justify-between">
          <h3 id="media-heading" className="text-md font-semibold">
            Media, links & docs
          </h3>
          <span className="text-sm text-muted tabular-nums">{thread.mediaCount}</span>
        </div>
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {thread.media.map((tone, index) => (
            <li key={`${tone}-${index}`}>
              <span
                role="img"
                aria-label={`Shared photo ${index + 1}`}
                className={cn("block aspect-square rounded-md", toneGradient(tone))}
              />
            </li>
          ))}
        </ul>
        <ul className="mt-5 flex flex-col gap-3">
          {thread.shared.map((item) => (
            <li key={item.name} className="flex items-center gap-3">
              <span className="inline-grid size-10 shrink-0 place-items-center rounded-md border border-line bg-surface text-muted">
                {item.kind === "file" ? <FileTextIcon size={18} /> : <LinkIcon size={18} />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-base font-medium">{item.name}</span>
                <span className="text-xs text-muted">{item.meta}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
      {thread.commonGroups.length > 0 ? (
        <section aria-labelledby="groups-heading" className="border-t border-line px-6 py-6">
          <h3 id="groups-heading" className="text-md font-semibold">
            {thread.commonGroups.length} groups in common
          </h3>
          <ul className="mt-3 flex flex-col gap-1">
            {thread.commonGroups.map((group) => (
              <li key={group.id}>
                <Link
                  href={chatHref(group.id)}
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-surface"
                >
                  <Avatar initials={group.initials} tone={group.tone} size="md" shape="square" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-medium">{group.title}</span>
                    <span className="text-xs text-muted">{group.memberCount}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
