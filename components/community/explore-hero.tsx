import { CompassIcon } from "@/components/icons/compass-icon";
import { UsersIcon } from "@/components/icons/users-icon";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils/cn";
import { compactCount } from "@/lib/utils/format";
import type { CommunitySummary } from "@/types/community";

type ExploreHeroProps = {
  featured: CommunitySummary[];
  query: string;
};

const offsets = ["lg:ml-12", "lg:mr-12", "lg:ml-16"];

export function ExploreHero({ featured, query }: ExploreHeroProps) {
  return (
    <section
      id="explore"
      aria-labelledby="explore-title"
      className="grid gap-8 overflow-hidden rounded-[24px] border border-accent-line bg-linear-to-br from-accent-soft via-surface to-accent-soft p-6 md:p-10 xl:grid-cols-[1.3fr_1fr] xl:items-center"
    >
      <div className="flex flex-col items-start">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-accent-line bg-card/70 px-3 text-sm font-medium text-accent-text">
          <CompassIcon size={15} />
          Explore
        </span>
        <h1 id="explore-title" className="mt-5 text-4xl font-semibold md:text-5xl">
          Find your people.
          <br />
          <span className="text-accent-text">Build together.</span>
        </h1>
        <p className="mt-4 max-w-xl text-md text-muted md:text-lg">
          Join communities with rooms for every topic, announcements that actually get read, and
          groups that stay in sync.
        </p>
        <form action="/communities" role="search" className="mt-6 flex w-full max-w-xl flex-wrap gap-3">
          <SearchInput
            label="Search all communities"
            name="q"
            size="lg"
            placeholder="Search communities"
            defaultValue={query}
            className="min-w-0 flex-1 basis-64 bg-card"
          />
          <Button type="submit" size="lg" className="h-13">
            Explore
          </Button>
        </form>
      </div>
      <ul aria-label="Trending now" className="flex flex-col gap-3 max-xl:hidden">
        {featured.map((community, index) => (
          <li
            key={community.id}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-line bg-card p-4 shadow-md",
              offsets[index % offsets.length],
            )}
          >
            <Avatar initials={community.initials} tone={community.tone} image={community.image} size="lg" shape="square" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-md font-semibold">{community.name}</span>
              <span className="truncate text-sm text-muted">{community.highlight}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-muted">
              <UsersIcon size={15} />
              {compactCount(community.memberCount)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
