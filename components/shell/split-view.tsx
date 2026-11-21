"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type SplitViewProps = {
  list: ReactNode;
  children: ReactNode;
  listLabel: string;
};

export function SplitView({ list, children, listLabel }: SplitViewProps) {
  const segment = useSelectedLayoutSegment();
  const open = segment !== null && !segment.startsWith("__");

  return (
    <>
      <aside
        aria-label={listLabel}
        className={cn(
          "flex w-full shrink-0 flex-col border-line bg-surface md:w-80 md:border-r xl:w-96",
          open && "max-md:hidden",
        )}
      >
        {list}
      </aside>
      <div className={cn("flex min-w-0 flex-1", !open && "max-md:hidden")}>{children}</div>
    </>
  );
}
