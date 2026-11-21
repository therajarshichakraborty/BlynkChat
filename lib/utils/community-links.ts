import type { Route } from "next";
import type { CategoryView } from "@/types/community";

export type CategoryFilter = CategoryView | "for-you";

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

export function roomHref(communitySlug: string, roomSlug = "general"): Route {
  return `/communities/${communitySlug}/${roomSlug}` as Route;
}

export const categoryOptions = communityCategories.filter(
  (category): category is { value: CategoryView; label: string } => category.value !== "for-you",
);
