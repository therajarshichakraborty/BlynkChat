import { Skeleton } from "@/components/ui/skeleton";

export function ConversationSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col" aria-busy="true" aria-label="Loading conversation">
      <div className="flex h-18 items-center gap-3 border-b border-line px-6">
        <Skeleton className="size-11 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-6 py-6">
        <Skeleton className="mx-auto h-6 w-16 rounded-full" />
        <Skeleton className="h-16 w-2/3 rounded-xl" />
        <Skeleton className="h-14 w-1/2 self-end rounded-xl" />
        <Skeleton className="h-24 w-3/5 rounded-xl" />
        <Skeleton className="h-12 w-2/5 self-end rounded-xl" />
      </div>
      <div className="px-6 pb-5">
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}
