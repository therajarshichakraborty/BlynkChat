import type { Metadata } from "next";
import { CommunitiesSidebar } from "@/components/community/communities-sidebar";
import { CommunityCard } from "@/components/community/community-card";
import { CommunityListItem } from "@/components/community/community-list-item";
import { ExploreHero } from "@/components/community/explore-hero";
import { ChevronDownIcon } from "@/components/icons/chevron-down-icon";
import { SearchIcon } from "@/components/icons/search-icon";
import { ChipLink } from "@/components/ui/chip-link";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getFeaturedCommunities,
  getJoinedCommunities,
  searchCommunities,
} from "@/lib/data/communities";
import { communityCategories, exploreHref, parseCategory } from "@/lib/utils/community-links";

export const metadata: Metadata = {
  title: "Explore communities",
  description: "Find communities with rooms for every topic on Relay.",
};

type CommunitiesPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function CommunitiesPage({ searchParams }: CommunitiesPageProps) {
  const params = await searchParams;
  const category = parseCategory(params.category);
  const query = params.q?.trim() ?? "";
  const results = searchCommunities(category, query);
  const joined = getJoinedCommunities();

  return (
    <>
      <CommunitiesSidebar joined={joined} query={query} />
      <main id="main" className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:px-8 md:py-8">
          <ExploreHero featured={getFeaturedCommunities()} query={query} />
          <section aria-labelledby="joined-mobile" className="lg:hidden">
            <h2 id="joined-mobile" className="px-1 pb-2 text-2xs font-semibold tracking-wider text-muted uppercase">
              Your communities
            </h2>
            <ul className="grid gap-1 sm:grid-cols-2">
              {joined.map((community) => (
                <CommunityListItem key={community.id} community={community} />
              ))}
            </ul>
          </section>
          <section aria-labelledby="directory-title" className="flex flex-col gap-5">
            <h2 id="directory-title" className="sr-only">
              Community directory
            </h2>
            <div className="flex items-center gap-4">
              <nav aria-label="Categories" className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
                <ul className="flex gap-2">
                  {communityCategories.map((item) => (
                    <li key={item.value}>
                      <ChipLink href={exploreHref(item.value, query)} active={item.value === category}>
                        {item.label}
                      </ChipLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm text-muted max-sm:hidden">
                Trending
                <ChevronDownIcon size={16} />
              </span>
            </div>
            {results.length > 0 ? (
              <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {results.map((community) => (
                  <CommunityCard key={community.id} community={community} />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<SearchIcon size={22} />}
                title="No communities found"
                description="Try another category or a different search."
              />
            )}
          </section>
        </div>
      </main>
    </>
  );
}
