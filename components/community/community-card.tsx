import Link from "next/link";
import { BadgeCheckIcon } from "@/components/icons/badge-check-icon";
import { Avatar } from "@/components/ui/avatar";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { roomHref } from "@/lib/utils/community-links";
import { cn } from "@/lib/utils/cn";
import { toneBanner } from "@/lib/utils/tone";
import type { Community } from "@/types/community";
import { JoinButton } from "./join-button";

type CommunityCardProps = {
  community: Community;
};

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
      <span aria-hidden="true" className={cn("h-24 shrink-0", toneBanner(community.tone))} />
      <div className="flex flex-1 flex-col px-5 pb-5">
        <Avatar
          initials={community.initials}
          tone={community.tone}
          size="xl"
          shape="square"
          className="-mt-8 self-start rounded-xl ring-4 ring-card"
        />
        <h3 className="mt-3 flex items-center gap-1.5 text-lg font-semibold tracking-tight">
          <Link href={roomHref(community.id)} className="truncate hover:underline">
            {community.name}
          </Link>
          {community.verified ? (
            <BadgeCheckIcon size={18} className="shrink-0 text-accent-text" aria-label="Verified" />
          ) : null}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-base text-muted">{community.description}</p>
        <div className="mt-auto flex items-center gap-3 pt-5">
          <AvatarStack people={community.memberSample} size="sm" />
          <span className="text-sm text-muted">{community.memberCount} members</span>
          <span className="ml-auto">
            <JoinButton name={community.name} initiallyJoined={community.joined} />
          </span>
        </div>
      </div>
    </li>
  );
}
