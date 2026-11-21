import type { ReactNode } from "react";
import { Rail } from "@/components/shell/rail";
import { TabBar } from "@/components/shell/tab-bar";
import { TimeZoneProvider } from "@/components/shell/time-zone";
import { getUnreadTotal } from "@/lib/data/chats";
import { getProfile } from "@/lib/data/users";
import { requireUser } from "@/lib/server/session";
import { getTimeZone } from "@/lib/server/time-zone";

type AppLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

export default async function AppLayout({ children, modal }: AppLayoutProps) {
  const user = await requireUser();
  const [me, unread, timeZone] = await Promise.all([getProfile(user.id), getUnreadTotal(user.id), getTimeZone()]);

  return (
    <TimeZoneProvider timeZone={timeZone}>
      <div className="flex h-dvh overflow-hidden bg-bg">
        <Rail me={me} unread={unread} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">{children}</div>
          <TabBar unread={unread} />
        </div>
        {modal}
      </div>
    </TimeZoneProvider>
  );
}
