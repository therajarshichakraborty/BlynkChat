import { Skeleton } from "@/components/ui/skeleton";

export default function RoomLoading() {
  return (
    <div className="flex min-w-0 flex-1" aria-busy="true" aria-label="Loading room">
      <div className="flex w-72 shrink-0 flex-col gap-3 border-r border-line bg-surface p-4 max-md:hidden xl:w-80">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-md" />
        ))}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-18 items-center gap-3 border-b border-line px-6">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 px-8 py-6">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
