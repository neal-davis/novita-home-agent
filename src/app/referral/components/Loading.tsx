import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max_width_container">
      <div className="mx-web my-20">
        <Skeleton className="h-[120px] rounded-sm animate-pulse" />
        <Skeleton className="h-[120px] rounded-sm animate-pulse my-6" />
        <Skeleton className="h-[120px] rounded-sm animate-pulse my-6" />
      </div>
    </div>
  );
}
