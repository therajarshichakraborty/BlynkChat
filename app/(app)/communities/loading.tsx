import { Skeleton } from "@/components/ui/skeleton";

export default function CommunitiesLoading() {
  return (
    <div className="flex min-w-0 flex-1" aria-busy="true" aria-label="Loading communities">
      <div className="flex w-80 shrink-0 flex-col gap-4 border-r border-line bg-surface p-4 max-lg:hidden xl:w-96">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <Skeleton className="h-64 w-full rounded-[24px]" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
