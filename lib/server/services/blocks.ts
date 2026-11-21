import "server-only";
import { db } from "../db";

export type BlockStatus = "none" | "by-me" | "by-them";

export async function blockStatus(userId: string, otherId: string): Promise<BlockStatus> {
  const blocks = await db.block.findMany({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherId },
        { blockerId: otherId, blockedId: userId },
      ],
    },
    select: { blockerId: true },
  });
  if (blocks.some((block) => block.blockerId === userId)) return "by-me";
  if (blocks.length > 0) return "by-them";
  return "none";
}

export async function blockedUserIds(userId: string): Promise<Set<string>> {
  const blocks = await db.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });
  return new Set(blocks.map((block) => (block.blockerId === userId ? block.blockedId : block.blockerId)));
}
