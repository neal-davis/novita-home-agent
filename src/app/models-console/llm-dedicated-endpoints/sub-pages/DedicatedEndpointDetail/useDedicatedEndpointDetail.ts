"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  updateLLMDedicatedEndpoint,
  restartLLMDedicatedEndpoint,
  getLLMDedicatedEndpointChangeHistory,
  ChangeHistoryRecord,
} from "@/api/dedicated-endpoint";
import { LLM_DE_STATUS } from "../../components/DEModelStatus";
import { formatRelativeTime } from "@/lib/utils/date";
import { message } from "@/components/ui/standard/notify";

const CHANGE_HISTORY_PAGE_SIZE = 5;

interface UseDedicatedEndpointDetailOptions {
  endpointData: LLMDedicatedEndpoint;
  syncEndpointData: () => Promise<void>;
  initialTab?: string;
}

export function useDedicatedEndpointDetail({
  endpointData,
  syncEndpointData,
  initialTab = "overview",
}: UseDedicatedEndpointDetailOptions) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Tab indicator animation
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Change history state
  const [changeHistoryRecords, setChangeHistoryRecords] = useState<
    ChangeHistoryRecord[]
  >([]);
  const [changeHistoryTotal, setChangeHistoryTotal] = useState(0);
  const [isChangeHistoryLoading, setIsChangeHistoryLoading] = useState(true);
  const [isChangeHistoryLoadingMore, setIsChangeHistoryLoadingMore] =
    useState(false);

  // Scroll console main container to top when entering detail page
  useEffect(() => {
    const mainContainer = document.querySelector(
      '[class*="ConsoleHeaderWrapper_main"]',
    );
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }, []);

  // Update indicator position when tab changes
  useEffect(() => {
    if (tabsRef.current) {
      const activeButton = tabsRef.current.querySelector(
        `[data-tab="${activeTab}"]`,
      ) as HTMLButtonElement;
      if (activeButton) {
        const containerRect = tabsRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
        });
      }
    }
  }, [activeTab]);

  // Auto sync endpoint data every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      syncEndpointData();
    }, 15000);

    return () => clearInterval(interval);
  }, [syncEndpointData]);

  // Fetch change history
  const fetchChangeHistory = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) {
          setIsChangeHistoryLoadingMore(true);
        } else {
          setIsChangeHistoryLoading(true);
        }

        const res = await getLLMDedicatedEndpointChangeHistory({
          endpointId: endpointData.id,
          pageNum,
          pageSize: CHANGE_HISTORY_PAGE_SIZE,
          sortKey: "newest",
        });

        if (append) {
          setChangeHistoryRecords((prev) => [...prev, ...res.records]);
        } else {
          setChangeHistoryRecords(res.records);
        }
        setChangeHistoryTotal(res.total);
      } catch (error) {
        console.error("Failed to fetch change history:", error);
      } finally {
        setIsChangeHistoryLoading(false);
        setIsChangeHistoryLoadingMore(false);
      }
    },
    [endpointData.id],
  );

  // Load more change history records
  const loadMoreChangeHistory = useCallback(async () => {
    if (changeHistoryRecords.length >= changeHistoryTotal) return;
    const nextPage =
      Math.floor(changeHistoryRecords.length / CHANGE_HISTORY_PAGE_SIZE) + 1;
    await fetchChangeHistory(nextPage, true);
  }, [changeHistoryRecords.length, changeHistoryTotal, fetchChangeHistory]);

  // Initial fetch of change history
  useEffect(() => {
    fetchChangeHistory(1);
  }, [fetchChangeHistory]);

  // Restart/Redeploy handler (for terminated/failed state)
  const handleRestart = useCallback(async () => {
    try {
      await restartLLMDedicatedEndpoint({ id: endpointData.id });
      await syncEndpointData();
    } catch (error) {
      console.error("Failed to restart endpoint:", error);
    }
  }, [endpointData.id, syncEndpointData]);

  // Wake up handler (for sleeping state)
  const handleWakeUp = useCallback(async () => {
    message.success("Endpoint is waking up");
    try {
      await restartLLMDedicatedEndpoint({ id: endpointData.id });
      await syncEndpointData();
    } catch (error) {
      console.error("Failed to wake up endpoint:", error);
      message.error("Failed to wake up endpoint");
    }
  }, [endpointData.id, syncEndpointData]);

  const handleUpdate = useCallback(
    async ({
      endpointName,
      loras,
      baseModel,
      scalingPolicy,
      engine,
      resources,
      isSuffixDecodingEnable,
    }: {
      endpointName?: string;
      loras?: LLMDedicatedEndpointLora[];
      baseModel?: LLMDedicatedEndpointModel;
      scalingPolicy?: LLMDedicatedEndpointScalingPolicy;
      engine?: LLMDedicatedEndpointEngine;
      resources?: LLMDedicatedEndpointResources;
      isSuffixDecodingEnable?: boolean;
    }) => {
      const payload: Record<string, any> = {};
      if (endpointName) {
        payload.name = endpointName;
      }
      if (loras) {
        payload.lora = { data: loras };
      }
      if (baseModel) {
        payload.baseModel = baseModel;
      }
      if (scalingPolicy) {
        payload.scalingPolicy = scalingPolicy;
      }
      if (engine) {
        payload.engine = engine;
      }
      if (resources) {
        payload.resources = resources;
      }
      if (isSuffixDecodingEnable !== undefined) {
        payload.isSuffixDecodingEnable = isSuffixDecodingEnable;
      }
      const result = await updateLLMDedicatedEndpoint({
        id: endpointData.id,
        updateData: payload,
      });
      // Refresh change history after successful update
      await fetchChangeHistory(1);
      return result;
    },
    [endpointData, fetchChangeHistory],
  );

  // Model display name
  const modelDisplayName = useMemo(() => {
    if (endpointData.baseModel?.modelAlias) {
      return endpointData.baseModel.modelAlias;
    }
    if (endpointData.baseModel?.modelId) {
      const parts = endpointData.baseModel.modelId.split("/");
      return parts[parts.length - 1];
    }
    return "Unknown Model";
  }, [endpointData.baseModel]);

  // Format create time
  const formattedCreateTime = useMemo(() => {
    return formatRelativeTime(endpointData.createTime);
  }, [endpointData.createTime]);

  // Status display text
  const statusText = useMemo(() => {
    return (
      endpointData.status.charAt(0).toUpperCase() + endpointData.status.slice(1)
    );
  }, [endpointData.status]);

  // Primary action buttons (Wake Up, Redeploy) - excludes Terminate
  const primaryActions = useMemo(() => {
    const actions: Array<{
      key: string;
      label: string;
      onClick: () => void;
    }> = [];

    switch (endpointData.status) {
      case LLM_DE_STATUS.SLEEPING:
        actions.push({
          key: "wake",
          label: "Wake Up",
          onClick: handleWakeUp,
        });
        break;

      case LLM_DE_STATUS.TERMINATED:
      case LLM_DE_STATUS.FAILED:
        actions.push({
          key: "redeploy",
          label: "Redeploy",
          onClick: handleRestart,
        });
        break;

      default:
        break;
    }

    return actions;
  }, [endpointData.status, handleWakeUp, handleRestart]);

  // Check if status allows terminate action
  const canTerminate = [
    LLM_DE_STATUS.PENDING,
    LLM_DE_STATUS.DEPLOYING,
    LLM_DE_STATUS.RUNNING,
    LLM_DE_STATUS.SLEEPING,
    LLM_DE_STATUS.ROLLING,
    LLM_DE_STATUS.SCALING,
  ].includes(endpointData.status);

  // Check if status allows delete action
  const canDelete = [LLM_DE_STATUS.TERMINATED, LLM_DE_STATUS.FAILED].includes(
    endpointData.status,
  );

  // Check if playground is available
  const canPlayground = endpointData.status === LLM_DE_STATUS.RUNNING;

  return {
    // State
    activeTab,
    showTerminateModal,
    showDeleteConfirm,
    indicatorStyle,
    // Change history
    changeHistoryRecords,
    changeHistoryTotal,
    isChangeHistoryLoading,
    isChangeHistoryLoadingMore,
    loadMoreChangeHistory,
    // Computed
    modelDisplayName,
    formattedCreateTime,
    statusText,
    primaryActions,
    canTerminate,
    canDelete,
    canPlayground,
    // Refs
    tabsRef,
    // Setters
    setActiveTab,
    setShowTerminateModal,
    setShowDeleteConfirm,
    // Handlers
    handleUpdate,
  };
}
