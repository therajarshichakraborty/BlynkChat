import { communities } from "@/lib/mock/communities";
import { defaultRooms, designEngineersRooms } from "@/lib/mock/rooms";
import { users } from "@/lib/mock/users";
import type { CommunityMember, CommunityRoomView } from "@/types/community";
import type { User } from "@/types/user";
import { getCommunity } from "./communities";

function fixtureFor(communityId: string, name: string) {
  return communityId === "design-engineers" ? designEngineersRooms : defaultRooms(name);
}

export function getRoomParams(): { id: string; room: string }[] {
  return communities.flatMap((community) =>
    fixtureFor(community.id, community.name).textRooms.map((room) => ({
      id: community.id,
      room: room.id,
    })),
  );
}

export function getRoomView(communityId: string, roomId: string): CommunityRoomView | undefined {
  const community = getCommunity(communityId);
  if (!community) return undefined;

  const fixture = fixtureFor(community.id, community.name);
  const room = fixture.textRooms.find((item) => item.id === roomId);
  if (!room) return undefined;

  const people: Record<string, User> = Object.fromEntries(users.map((user) => [user.id, user]));
  const admins: CommunityMember[] = [];
  const online: CommunityMember[] = [];
  const offline: CommunityMember[] = [];
  for (const user of users) {
    const role = fixture.roles[user.id];
    if (role) admins.push({ user, role });
    else if (user.online) online.push({ user, role: "member" });
    else offline.push({ user, role: "member" });
  }
  admins.sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0));

  return {
    community,
    room,
    textRooms: fixture.textRooms,
    voiceRooms: fixture.voiceRooms,
    pinned: fixture.pinned,
    onlineLabel: fixture.onlineLabel,
    people,
    messages: fixture.messages[room.id] ?? [],
    typingLabel: room.id === "general" ? fixture.typingLabel : undefined,
    admins,
    online: online.filter((member) => member.user.id !== "arjun"),
    offline,
    onlineCount: fixture.onlineCount,
    offlineCount: fixture.offlineCount,
    headerSample: admins
      .concat(online)
      .slice(0, 4)
      .map((member) => ({ initials: member.user.initials, tone: member.user.tone })),
    headerExtra: fixture.headerExtra,
  };
}
