import type { ReactNode } from "react";
import { Rail } from "@/components/shell/rail";
import { TabBar } from "@/components/shell/tab-bar";
import { requireUser } from "@/lib/server/session";

type AppLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

export default async function AppLayout({ children, modal }: AppLayoutProps) {
  await requireUser();

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Rail />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1">{children}</div>
        <TabBar />
      </div>
      {modal}
    </div>
  );
}
