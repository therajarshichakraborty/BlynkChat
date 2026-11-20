import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <span aria-hidden="true" className={cn("block animate-pulse rounded-md bg-raised", className)} />;
}
