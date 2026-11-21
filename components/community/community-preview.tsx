import { BadgeCheckIcon } from "@/components/icons/badge-check-icon";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon";
import { Avatar } from "@/components/ui/avatar";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { IconLink } from "@/components/ui/icon-link";
import { cn } from "@/lib/utils/cn";
import { compactCount } from "@/lib/utils/format";
import { toneBanner } from "@/lib/utils/tone";
import type { CommunitySummary } from "@/types/community";
import { JoinButton } from "./join-button";

type CommunityPreviewProps = {
  community: CommunitySummary;
};

export function CommunityPreview({ community }: CommunityPreviewProps) {
  return (
    <main id="main" className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-surface">
      <div className="px-2 pt-3 md:px-6 md:pt-5">
        <IconLink href="/communities" label="Back to communities">
          <ChevronLeftIcon size={22} />
        </IconLink>
      </div>
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 pb-10">
        <section className="w-full overflow-hidden rounded-[24px] border border-line bg-card shadow-lg">
          <div aria-hidden="true" className={cn("h-32", toneBanner(community.tone))} />
          <div className="flex flex-col items-center px-6 pb-8 text-center">
            <Avatar
              initials={community.initials}
              tone={community.tone}
              image={community.image}
              size="2xl"
              shape="square"
              className="-mt-11 ring-4 ring-card"
            />
            <h1 className="mt-4 flex items-center gap-1.5 text-2xl font-semibold tracking-tight">
              {community.name}
              {community.verified ? (
                <BadgeCheckIcon size={20} className="text-accent-text" aria-hidden={false} role="img" aria-label="Verified" />
              ) : null}
            </h1>
            <p className="mt-2 text-base text-muted">{community.description}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <AvatarStack people={community.memberSample} size="sm" />
              {compactCount(community.memberCount)} members
            </p>
            <div className="mt-6">
              <JoinButton
                communityId={community.id}
                slug={community.slug}
                name={community.name}
                initiallyJoined={false}
                openAfterJoin
                size="lg"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
