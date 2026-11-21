import { CircleDashedIcon } from "@/components/icons/circle-dashed-icon";
import { MessageCircleIcon } from "@/components/icons/message-circle-icon";
import { PhoneIcon } from "@/components/icons/phone-icon";
import { SettingsIcon } from "@/components/icons/settings-icon";
import { UsersIcon } from "@/components/icons/users-icon";
import { getUnreadTotal } from "@/lib/data/chats";
import { NavLink } from "./nav-link";
import { SoonTab } from "./soon-tab";
import { TabBarFrame } from "./tab-bar-frame";

export function TabBar() {
  return (
    <TabBarFrame>
      <NavLink href="/chats" match="/chats" label="Chats" variant="tab" badge={getUnreadTotal()}>
        <MessageCircleIcon size={22} />
      </NavLink>
      <SoonTab label="Updates">
        <CircleDashedIcon size={22} />
      </SoonTab>
      <NavLink href="/communities" match="/communities" label="Communities" variant="tab">
        <UsersIcon size={22} />
      </NavLink>
      <SoonTab label="Calls">
        <PhoneIcon size={22} />
      </SoonTab>
      <NavLink href="/settings" match="/settings" label="Settings" variant="tab">
        <SettingsIcon size={22} />
      </NavLink>
    </TabBarFrame>
  );
}
