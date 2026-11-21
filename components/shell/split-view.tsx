import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SplitViewProps = {
  list: ReactNode;
  children: ReactNode;
  listLabel: string;
  open: boolean;
};

export function SplitView({ list, children, listLabel, open }: SplitViewProps) {
  return (
    <>
      <aside
        aria-label={listLabel}
        className={cn(
          "flex w-full shrink-0 flex-col border-line bg-bg md:w-80 md:border-r md:bg-surface xl:w-96",
          open && "max-md:hidden",
        )}
      >
        {list}
      </aside>
      <div className={cn("flex min-w-0 flex-1", !open && "max-md:hidden")}>{children}</div>
    </>
  );
}
