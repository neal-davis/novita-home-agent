"use client";

import { useMemo } from "react";
import InstanceConfig from "./InstanceConfig";
import EngineInfo from "../EngineInfo";
import AutoscalingInfo from "../AutoscalingInfo";
import ChangeHistory from "./ChangeHistory";
import { AlertCircle } from "lucide-react";
import { ChangeHistoryRecord } from "@/api/dedicated-endpoint";
import { isEndpointEditLocked, isEndpointLoraEditLocked } from "./editLock";

interface SettingsTabProps {
  endpointData: LLMDedicatedEndpoint;
  handleUpdate: (params: {
    endpointName?: string;
    loras?: LLMDedicatedEndpointLora[];
    baseModel?: LLMDedicatedEndpointModel;
    scalingPolicy?: LLMDedicatedEndpointScalingPolicy;
    engine?: LLMDedicatedEndpointEngine;
    resources?: LLMDedicatedEndpointResources;
    isSuffixDecodingEnable?: boolean;
  }) => Promise<void>;
  syncEndpointData: () => Promise<void>;
  onEditLora?: () => void;
  changeHistoryRecords: ChangeHistoryRecord[];
  changeHistoryTotal: number;
  isChangeHistoryLoading: boolean;
  isChangeHistoryLoadingMore: boolean;
  loadMoreChangeHistory: () => Promise<void>;
}

export default function SettingsTab({
  endpointData,
  handleUpdate,
  syncEndpointData,
  onEditLora,
  changeHistoryRecords,
  changeHistoryTotal,
  isChangeHistoryLoading,
  isChangeHistoryLoadingMore,
  loadMoreChangeHistory,
}: SettingsTabProps) {
  const {
    status,
    baseModel,
    resources,
    engine,
    scalingPolicy,
    isSuffixDecodingEnable,
    name,
    loras,
  } = endpointData;

  const isLocked = useMemo(() => isEndpointEditLocked(status), [status]);
  const isLoraLocked = useMemo(
    () => isEndpointLoraEditLocked(status),
    [status],
  );

  return (
    <div className="space-y-8">
      {/* Instance Configuration */}
      <div className={isLocked && isLoraLocked ? "opacity-60" : ""}>
        <InstanceConfig
          baseModel={baseModel}
          resources={resources}
          engine={engine}
          loras={loras}
          onEditLora={onEditLora}
          isLocked={isLoraLocked}
        />
      </div>

      {/* Lock Warning - placed before editable sections */}
      {isLocked && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[6px] bg-[var(--yellow-6)]">
          <AlertCircle className="w-4 h-4 text-[var(--yellow-1)] shrink-0" />
          <p className="font-small text-[var(--yellow-1)]">
            Most settings are locked while endpoint is in{" "}
            <span className="font-medium">{status}</span> state.
          </p>
        </div>
      )}

      {/* Engine Configuration (Editable when not locked) */}
      <div className={isLocked ? "opacity-60" : ""}>
        <EngineInfo
          engine={engine}
          isSuffixDecodingEnable={isSuffixDecodingEnable}
          handleUpdate={(params) => handleUpdate(params)}
          syncEndpointData={syncEndpointData}
          isLocked={isLocked}
        />
      </div>

      {/* Autoscaling Configuration (Editable when not locked) */}
      <div className={isLocked ? "opacity-60" : ""}>
        <AutoscalingInfo
          scalingPolicy={scalingPolicy}
          singleInstanceGpuNum={resources.gpu.count}
          endpointName={name}
          handleUpdate={(policy) => handleUpdate({ scalingPolicy: policy })}
          syncEndpointData={syncEndpointData}
          isLocked={isLocked}
        />
      </div>

      {/* Change History */}
      <ChangeHistory
        records={changeHistoryRecords}
        total={changeHistoryTotal}
        isLoading={isChangeHistoryLoading}
        isLoadingMore={isChangeHistoryLoadingMore}
        onLoadMore={loadMoreChangeHistory}
      />
    </div>
  );
}
