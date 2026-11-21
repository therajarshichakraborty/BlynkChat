import "server-only";
import { getInvitePreview } from "@/lib/server/services/groups";
import type { InvitePreview } from "@/types/conversation";

export function getInvite(userId: string, code: string): Promise<InvitePreview | null> {
  return getInvitePreview(userId, code);
}
