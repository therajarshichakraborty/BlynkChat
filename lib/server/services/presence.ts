import "server-only";
import { db } from "../db";
import { initialsFor } from "@/lib/utils/initials";
import { consume } from "../rate-limit";
import { publish, toConversation } from "../realtime/publish";
import { cancelOffline, scheduleOffline } from "../realtime/presence";
import { toTone } from "../views/people";
import { blockStatus } from "./blocks";
import { requireMembership } from "./conversations";

const offlineGraceMs = 4000;

async function announce(userId: string, online: boolean, lastSeenAt: Date | null) {
  const settings = await db.userSettings.findUnique({ where: { userId }, select: { lastSeenVisibility: true } });
  const visibility = settings?.lastSeenVisibility ?? "EVERYONE";
  if (visibility === "NOBODY") return;
  await publish(
    "presence",
    { userId, online, lastSeenAt: lastSeenAt?.toISOString() ?? null },
    { kind: "contacts", userId, directOnly: visibility === "CONTACTS" },
  );
}

export async function markOnline(userId: string, firstConnection: boolean) {
  const resumed = cancelOffline(userId);
  if (!firstConnection || resumed) return;
  await announce(userId, true, null);
}

export function markDisconnected(userId: string) {
  scheduleOffline(userId, offlineGraceMs, () => {
    void (async () => {
      const lastSeenAt = new Date();
      await db.user.update({ where: { id: userId }, data: { lastSeenAt } }).catch(() => undefined);
      await announce(userId, false, lastSeenAt);
    })();
  });
}

export async function signalTyping(userId: string, conversationId: string) {
  if (!consume(`typing:${userId}:${conversationId}`, 1, 2500)) return false;
  const member = await requireMembership(userId, conversationId);
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, tone: true, settings: { select: { typingIndicator: true } } },
  });
  if (!user || user.settings?.typingIndicator === false) return false;
  const { conversation } = member;
  if (conversation.onlyAdminsCanPost && member.role === "MEMBER") return false;
  if (conversation.type === "DIRECT") {
    const peer = await db.conversationMember.findFirst({
      where: { conversationId, userId: { not: userId } },
      select: { userId: true },
    });
    if (peer && (await blockStatus(userId, peer.userId)) !== "none") return false;
  }
  await publish(
    "typing",
    { conversationId, userId, name: user.name, initials: initialsFor(user.name), tone: toTone(user.tone) },
    toConversation(conversationId, [userId]),
  );
  return true;
}
