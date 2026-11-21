import type { ReactNode } from "react";
import { Rail } from "@/components/shell/rail";
import { TabBar } from "@/components/shell/tab-bar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <Rail />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1">{children}</div>
        <TabBar />
      </div>
    </div>
  );
}
