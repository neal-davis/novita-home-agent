"use client";

import { useCallback } from "react";
import HealthStatus from "./HealthStatus";
import KeyMetrics from "./KeyMetrics";
import QuickStart from "./QuickStart";
import RecentActivity from "./RecentActivity";
import ReplicasInfo from "./ReplicasInfo";
import EngineConfigOverview from "./EngineConfigOverview";
import { ChangeHistoryRecord } from "@/api/dedicated-endpoint";

interface OverviewTabProps {
  endpointData: LLMDedicatedEndpoint;
  onSwitchTab?: (tab: string) => void;
  onEditLora?: () => void;
  changeHistoryRecords: ChangeHistoryRecord[];
  isChangeHistoryLoading: boolean;
}

export default function OverviewTab({
  endpointData,
  onSwitchTab,
  onEditLora,
  changeHistoryRecords,
  isChangeHistoryLoading,
}: OverviewTabProps) {
  const {
    status,
    phase,
    url,
    baseModel,
    replica,
    readyReplica,
    scalingPolicy,
  } = endpointData;

  // Navigate to Settings tab and scroll to Autoscaling section
  const handleEditAutoscaling = useCallback(() => {
    if (onSwitchTab) {
      onSwitchTab("settings");
    }
  }, [onSwitchTab]);

  return (
    <div className="space-y-4">
      {/* Row 1: Health + Replicas side by side */}
      <div className="grid grid-cols-2 gap-4">
        <HealthStatus status={status} phase={phase} />
        <ReplicasInfo
          replica={replica}
          readyReplica={readyReplica}
          minReplicas={scalingPolicy?.minReplicas ?? 1}
          maxReplicas={scalingPolicy?.maxReplicas ?? 1}
        />
      </div>

      {/* Row 2: Key Metrics - always visible, grayed when not running */}
      <KeyMetrics
        status={status}
        endpointId={endpointData.id}
        onViewAll={onSwitchTab ? () => onSwitchTab("metrics") : undefined}
      />

      {/* Row 3: Quick Start (left) + Engine Config & Recent Activity (right) */}
      <div className="grid grid-cols-2 gap-4">
        <QuickStart
          endpointUrl={url}
          modelId={baseModel?.modelAlias || baseModel?.modelId || ""}
        />
        <div className="space-y-4">
          <EngineConfigOverview
            endpointData={endpointData}
            onEditAutoscaling={handleEditAutoscaling}
            onEditLora={onEditLora}
          />
          <RecentActivity
            records={changeHistoryRecords.slice(0, 3)}
            isLoading={isChangeHistoryLoading}
            onViewAll={onSwitchTab ? () => onSwitchTab("settings") : undefined}
          />
        </div>
      </div>
    </div>
  );
}
