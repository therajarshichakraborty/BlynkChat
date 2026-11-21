"use server";

import { revalidatePath } from "next/cache";
import { runAction } from "@/lib/server/action";
import {
  createCommunity as createCommunityService,
  joinCommunity,
  leaveCommunity,
} from "@/lib/server/services/communities";
import { listThreadReplies } from "@/lib/server/services/messages";
import { communitySchema, membershipSchema, threadSchema, type CommunityValues } from "@/lib/validation/communities";

export async function createCommunity(input: CommunityValues) {
  return runAction(communitySchema, input, async (userId, data) => {
    const result = await createCommunityService(userId, data);
    revalidatePath("/communities", "layout");
    return result;
  });
}

export async function setCommunityMembership(input: { communityId: string; join: boolean }) {
  return runAction(membershipSchema, input, async (userId, data) => {
    const result = data.join ? await joinCommunity(userId, data.communityId) : await leaveCommunity(userId, data.communityId);
    revalidatePath("/communities", "layout");
    revalidatePath("/chats", "layout");
    return result;
  });
}

export async function loadThread(input: { rootId: string }) {
  return runAction(threadSchema, input, (userId, data) => listThreadReplies(userId, data.rootId));
}
