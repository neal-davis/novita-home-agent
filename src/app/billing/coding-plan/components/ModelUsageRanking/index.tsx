"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ModelRanking, formatTokens } from "../../types";
import { cn } from "@/lib/utils";

interface ModelUsageRankingProps {
  data: ModelRanking[];
  className?: string;
  isLoading: boolean;
}

export default function ModelUsageRanking({
  className,
  data,
  isLoading,
}: ModelUsageRankingProps) {
  return (
    <div className={cn("flex flex-col gap-3 overflow-hidden", className)}>
      <h3 className="font-h6 text-[var(--dark-1)] h-8 py-1">
        Top models by raw token usage
      </h3>
      <div className="flex-1 bg-[var(--white)] border border-[var(--gray-2)] rounded-lg overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--gray-1)]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-[1] bg-[var(--gray-3)] h-10">
            <tr className="bg-[var(--gray-3)]">
              <th className="font-subtle-medium text-[var(--dark-3-1)] text-left pl-9 bg-[var(--gray-3)]">
                Name
              </th>
              <th className="font-subtle-medium text-[var(--dark-3-1)] text-right p-2 pr-6 bg-[var(--gray-3)]">
                Tokens
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-[var(--gray-2)]">
                    <td className="py-2.5 px-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-2.5 px-3 pr-6">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              : data.map((item, index) => (
                  <tr
                    key={item.rank}
                    className={`border-b border-[var(--gray-2)] ${index === data.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span className="font-subtle text-[var(--dark-4)] min-w-4">
                        {item.rank}.
                      </span>
                      <span className="font-subtle-medium text-[var(--dark-3-1)]">
                        {item.modelId}
                      </span>
                    </td>
                    <td className="font-subtle-medium text-[var(--black)] py-2.5 px-3 pr-6 text-right">
                      {formatTokens(item.tokens)}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
