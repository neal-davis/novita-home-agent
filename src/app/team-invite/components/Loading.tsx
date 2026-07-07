import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Skeleton className="h-[30px] rounded-sm animate-pulse" />
      <Skeleton className="h-[30px] rounded-sm animate-pulse my-4" />
      <Skeleton className="h-[30px] rounded-sm animate-pulse my-4" />
    </>
  );
}
