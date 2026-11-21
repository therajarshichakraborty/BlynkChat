import type { Route } from "next";
import { afterAuthRoute } from "@/lib/site";

export function safeRedirect(target: string | null | undefined): Route {
  if (!target || !target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return afterAuthRoute;
  }
  return target as Route;
}
