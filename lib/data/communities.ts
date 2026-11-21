import { communities } from "@/lib/mock/communities";
import type { Community, CommunityCategory } from "@/types/community";

export function getJoinedCommunities(): Community[] {
  return communities.filter((community) => community.joined);
}

export function getCommunity(id: string): Community | undefined {
  return communities.find((community) => community.id === id);
}

export function getFeaturedCommunities(): Community[] {
  return communities.filter((community) => community.highlight);
}

export function searchCommunities(category: CommunityCategory | "for-you", query: string): Community[] {
  const needle = query.trim().toLowerCase();
  return communities.filter(
    (community) =>
      (category === "for-you" || community.categories.includes(category)) &&
      (!needle ||
        community.name.toLowerCase().includes(needle) ||
        community.description.toLowerCase().includes(needle)),
  );
}
