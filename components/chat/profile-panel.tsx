import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { BellIcon } from "@/components/icons/bell-icon";
import { FileTextIcon } from "@/components/icons/file-text-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { VideoIcon } from "@/components/icons/video-icon";
import { Avatar } from "@/components/ui/avatar";
import { formatBytes } from "@/lib/utils/time";
import type { ConversationDetails, ConversationView } from "@/types/conversation";
import { ProfileAction } from "./profile-action";

type ProfilePanelProps = {
  conversation: ConversationView;
  details: ConversationDetails;
  muteAction?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
};

export function ProfilePanel({ conversation, details, muteAction, children, footer }: ProfilePanelProps) {
  const { peer } = conversation;
  const subtitle = peer
    ? [peer.title, peer.location].filter(Boolean).join(" · ") || `@${peer.username}`
    : `${conversation.memberCount} members`;
  const about = peer ? peer.bio : conversation.description;

  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
        <Avatar initials={conversation.initials} tone={conversation.tone} image={conversation.image} size="2xl" />
        <h2 className="mt-4 text-xl font-semibold tracking-tight">{conversation.title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
        {about ? <p className="mt-3 text-base">{about}</p> : null}
        <ul className="mt-6 flex w-full gap-2.5">
          <ProfileAction icon={<PhoneIcon size={19} />} label="Audio" soon />
          <ProfileAction icon={<VideoIcon size={19} />} label="Video" soon />
          {muteAction ?? <ProfileAction icon={<BellIcon size={19} />} label="Mute" />}
        </ul>
      </section>
      {children}
      <section aria-labelledby="media-heading" className="border-t border-line px-6 py-6">
        <div className="flex items-center justify-between">
          <h3 id="media-heading" className="text-md font-semibold">
            Media, links & docs
          </h3>
          <span className="text-sm text-muted tabular-nums">{details.mediaCount}</span>
        </div>
        {details.media.length === 0 && details.files.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Photos and files you share will show up here.</p>
        ) : null}
        {details.media.length > 0 ? (
          <ul className="mt-4 grid grid-cols-3 gap-2">
            {details.media.map((item) => (
              <li key={item.id}>
                <a href={item.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md">
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={160}
                    height={160}
                    unoptimized
                    className="aspect-square w-full bg-surface object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {details.files.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-3">
            {details.files.map((file) => (
              <li key={file.id}>
                <a href={`${file.url}?download=1`} download={file.name} className="flex items-center gap-3">
                  <span className="inline-grid size-10 shrink-0 place-items-center rounded-md border border-line bg-surface text-muted">
                    <FileTextIcon size={18} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-medium">{file.name}</span>
                    <span className="text-xs text-muted">{formatBytes(file.size)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      {details.commonGroups.length > 0 ? (
        <section aria-labelledby="groups-heading" className="border-t border-line px-6 py-6">
          <h3 id="groups-heading" className="text-md font-semibold">
            {details.commonGroups.length} {details.commonGroups.length === 1 ? "group" : "groups"} in common
          </h3>
          <ul className="mt-3 flex flex-col gap-1">
            {details.commonGroups.map((group) => (
              <li key={group.id}>
                <Link
                  href={group.href as Route}
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 hover:bg-surface"
                >
                  <Avatar initials={group.initials} tone={group.tone} size="md" shape="square" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-medium">{group.title}</span>
                    <span className="text-xs text-muted">{group.memberCount} members</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {footer}
    </div>
  );
}
