import "server-only";
import { listJoinRequests } from "@/lib/server/services/group-settings";
import { getInvitePreview } from "@/lib/server/services/groups";
import type { InvitePreview, JoinRequestView } from "@/types/conversation";

export function getInvite(userId: string, code: string): Promise<InvitePreview | null> {
  return getInvitePreview(userId, code);
}

export function getJoinRequests(userId: string, conversationId: string): Promise<JoinRequestView[]> {
  return listJoinRequests(userId, conversationId);
}
