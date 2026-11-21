import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { roomHref } from "@/lib/utils/community-links";
import type { Community } from "@/types/community";

type CommunityListItemProps = {
  community: Community;
};

export function CommunityListItem({ community }: CommunityListItemProps) {
  return (
    <li>
      <Link
        href={roomHref(community.id)}
        className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors duration-150 hover:border-line hover:bg-card"
      >
        <Avatar initials={community.initials} tone={community.tone} size="lg" shape="square" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-md font-medium">{community.name}</span>
          <span className="truncate text-sm text-muted">{community.activity}</span>
        </span>
        {community.unread > 0 ? <Badge count={community.unread} label="unread" /> : null}
      </Link>
    </li>
  );
}
