import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentSkeletonProps {
  count?: number;
  itemHeight?: number;
  className?: string;
}

const ContentSkeletonDeep = ({
  count = 3,
  itemHeight = 160,
  className = "",
}: ContentSkeletonProps) => {
  return (
    <div className={`flex flex-col flex-wrap gap-4 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="w-full rounded-[var(--radius-form)]"
          style={{
            height: `${itemHeight}px`,
            backgroundColor: "var(--gray-3)",
          }}
        />
      ))}
    </div>
  );
};

export default ContentSkeletonDeep;
