"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyUsage } from "../../types";
import UsageHeatmap from "./UsageHeatmap";
import UsageBarChart from "./UsageBarChart";
import { cn } from "@/lib/utils";

interface DailyUsageSectionProps {
  className?: string;
  data: DailyUsage[];
  isLoading: boolean;
}

export default function DailyUsageSection({
  className,
  data,
}: DailyUsageSectionProps) {
  const [activeTab, setActiveTab] = useState("heatmap");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex gap-6 items-center">
        <h3 className="font-h6 text-[var(--dark-1)] m-0">
          Daily usage (tokens)
        </h3>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList tabsStyle="block" className="h-8 p-0.5 bg-[var(--gray-2)]">
            <TabsTrigger
              value="heatmap"
              className="font-subtle-medium px-3 py-1 h-7 text-[var(--dark-1)] data-[state=active]:text-[var(--brand-1)]"
            >
              Heatmap
            </TabsTrigger>
            <TabsTrigger
              value="chart"
              className="font-subtle-medium px-3 py-1 h-7 text-[var(--dark-1)] data-[state=active]:text-[var(--brand-1)]"
            >
              Chart
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div
        className={
          "bg-[var(--white)] border border-[var(--gray-2)] rounded-lg p-6 pb-2 flex-1 h-[200px]"
        }
      >
        {activeTab === "heatmap" ? (
          <UsageHeatmap data={data} />
        ) : (
          <UsageBarChart data={data} />
        )}
      </div>
    </div>
  );
}
