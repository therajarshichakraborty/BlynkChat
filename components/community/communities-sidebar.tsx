import { PlusIcon } from "@/components/icons/plus-icon";
import { SparklesIcon } from "@/components/icons/sparkles-icon";
import { ButtonLink } from "@/components/ui/button-link";
import { IconLink } from "@/components/ui/icon-link";
import { SearchInput } from "@/components/ui/search-input";
import type { Community } from "@/types/community";
import { CommunityListItem } from "./community-list-item";

type CommunitiesSidebarProps = {
  joined: Community[];
  query: string;
};

export function CommunitiesSidebar({ joined, query }: CommunitiesSidebarProps) {
  return (
    <aside
      aria-label="Your communities"
      className="flex w-80 shrink-0 flex-col border-r border-line bg-surface max-lg:hidden xl:w-96"
    >
      <div className="flex flex-col gap-4 px-4 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Communities</h2>
          <IconLink href="/communities#explore" label="Explore communities" variant="outline">
            <PlusIcon size={20} />
          </IconLink>
        </div>
        <form action="/communities" role="search">
          <SearchInput label="Search communities" name="q" placeholder="Search communities" defaultValue={query} />
        </form>
      </div>
      <h3 className="px-7 pt-6 pb-2 text-2xs font-semibold tracking-wider text-muted uppercase">
        Your communities
      </h3>
      <ul className="flex flex-col gap-0.5 overflow-y-auto px-2">
        {joined.map((community) => (
          <CommunityListItem key={community.id} community={community} />
        ))}
      </ul>
      <div className="mt-auto p-4">
        <div className="rounded-xl border border-line bg-linear-to-br from-card via-card to-accent-soft p-5 shadow-sm">
          <span className="inline-grid size-10 place-items-center rounded-md bg-accent-solid text-on-accent shadow-accent">
            <SparklesIcon size={20} />
          </span>
          <h3 className="mt-4 text-md font-semibold">Start a community</h3>
          <p className="mt-1 text-sm text-muted">
            Bring groups, rooms and announcements under one roof.
          </p>
          <ButtonLink href="/communities#explore" variant="dark" size="sm" className="mt-4 h-9">
            Create community
          </ButtonLink>
        </div>
      </div>
    </aside>
  );
}
