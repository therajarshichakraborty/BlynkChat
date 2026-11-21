import "server-only";
import { cache } from "react";
import {
  featuredCommunities,
  firstRoomHref,
  getRoomPage,
  listJoinedCommunities,
  searchCommunities as searchCommunitiesService,
  type RoomPageResult,
} from "@/lib/server/services/communities";
import type { CategoryFilter } from "@/lib/utils/community-links";
import type { CommunitySummary } from "@/types/community";

export function getJoinedCommunities(userId: string): Promise<CommunitySummary[]> {
  return listJoinedCommunities(userId);
}

export function getFeaturedCommunities(userId: string): Promise<CommunitySummary[]> {
  return featuredCommunities(userId);
}

export function searchCommunities(userId: string, category: CategoryFilter, query: string): Promise<CommunitySummary[]> {
  return searchCommunitiesService(userId, category, query);
}

export const getRoom = cache(
  (userId: string, slug: string, room: string): Promise<RoomPageResult> => getRoomPage(userId, slug, room),
);

export function getRoomsHref(userId: string): Promise<string> {
  return firstRoomHref(userId);
}
