import type { Route } from "next";
import type { CommunityCategory } from "@/types/community";

export type CategoryFilter = CommunityCategory | "for-you";

export const communityCategories: { value: CategoryFilter; label: string }[] = [
  { value: "for-you", label: "For you" },
  { value: "technology", label: "Technology" },
  { value: "design", label: "Design" },
  { value: "ml", label: "AI & ML" },
  { value: "startups", label: "Startups" },
  { value: "campus", label: "Campus" },
  { value: "hobbies", label: "Hobbies" },
  { value: "local", label: "Local" },
];

export function parseCategory(value: string | undefined): CategoryFilter {
  return communityCategories.find((category) => category.value === value)?.value ?? "for-you";
}

export function exploreHref(category: CategoryFilter, query: string): Route {
  const params = new URLSearchParams();
  if (category !== "for-you") params.set("category", category);
  if (query) params.set("q", query);
  const search = params.toString();
  return (search ? `/communities?${search}` : "/communities") as Route;
}

export function roomHref(communityId: string, roomId = "general"): Route {
  return `/communities/${communityId}/${roomId}` as Route;
}
