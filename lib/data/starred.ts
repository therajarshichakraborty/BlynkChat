import "server-only";
import { listStarred } from "@/lib/server/services/stars";
import type { StarredItem } from "@/types/message";

export function getStarredMessages(userId: string): Promise<StarredItem[]> {
  return listStarred(userId);
}
