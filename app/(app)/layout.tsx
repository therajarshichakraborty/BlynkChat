import type { ReactNode } from "react";
import { Rail } from "@/components/shell/rail";
import { RealtimeBridge } from "@/components/shell/realtime-bridge";
import { TabBar } from "@/components/shell/tab-bar";
import { TimeZoneProvider } from "@/components/shell/time-zone";
import { UnreadProvider } from "@/components/shell/unread-provider";
import { ToastProvider } from "@/components/ui/toast";
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
      <ToastProvider>
        <UnreadProvider initial={unread} meId={me.id}>
          <div className="flex h-dvh overflow-hidden bg-bg">
            <Rail me={me} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1">{children}</div>
              <TabBar />
            </div>
            {modal}
          </div>
          <RealtimeBridge />
        </UnreadProvider>
      </ToastProvider>
    </TimeZoneProvider>
  );
}
