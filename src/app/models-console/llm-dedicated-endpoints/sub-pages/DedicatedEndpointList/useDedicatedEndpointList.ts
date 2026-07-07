"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { message } from "@/components/ui/standard/notify";
import { restartLLMDedicatedEndpoint } from "@/api/dedicated-endpoint";

interface UseDedicatedEndpointListOptions {
  dedicatedEndpointList: LLMDedicatedEndpoint[];
  loading: boolean;
  filterStatus: string;
  filterEndpointName: string;
  refreshList: () => void;
  goToCreateEndpoint: () => void;
}

export function useDedicatedEndpointList({
  dedicatedEndpointList,
  loading,
  filterStatus,
  filterEndpointName,
  refreshList,
  goToCreateEndpoint,
}: UseDedicatedEndpointListOptions) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [targetEndpoint, setTargetEndpoint] =
    useState<LLMDedicatedEndpoint | null>(null);

  useEffect(() => {
    if (dedicatedEndpointList.length > 0 || !loading) {
      setIsInitialLoad(false);
    }
  }, [dedicatedEndpointList, loading]);

  const handleCreateEndpoint = useCallback(() => {
    goToCreateEndpoint();
  }, [goToCreateEndpoint]);

  // Terminate handler - shows confirmation modal
  const handleTerminate = useCallback((endpoint: LLMDedicatedEndpoint) => {
    setTargetEndpoint(endpoint);
    setShowTerminateModal(true);
  }, []);

  // Delete handler - shows confirmation modal
  const handleDelete = useCallback((endpoint: LLMDedicatedEndpoint) => {
    setTargetEndpoint(endpoint);
    setShowDeleteConfirm(true);
  }, []);

  // Redeploy handler - calls API directly
  const handleRedeploy = useCallback(
    async (endpoint: LLMDedicatedEndpoint) => {
      try {
        await restartLLMDedicatedEndpoint({ id: endpoint.id });
        message.success("Endpoint is being redeployed");
        refreshList();
      } catch (error) {
        console.error("Failed to redeploy endpoint:", error);
        message.error("Failed to redeploy endpoint");
      }
    },
    [refreshList],
  );

  // Wake up handler - calls API directly
  const handleWake = useCallback(
    async (endpoint: LLMDedicatedEndpoint) => {
      message.success("Endpoint is waking up");
      try {
        await restartLLMDedicatedEndpoint({ id: endpoint.id });
        refreshList();
      } catch (error) {
        console.error("Failed to wake up endpoint:", error);
        message.error("Failed to wake up endpoint");
      }
    },
    [refreshList],
  );

  // Show guide when user has no endpoints (not filtered to empty)
  const isShowGetStarted = useMemo(() => {
    return (
      dedicatedEndpointList.length === 0 &&
      !loading &&
      (filterStatus === "" || filterStatus === "all") &&
      (filterEndpointName === "" || filterEndpointName === "all")
    );
  }, [dedicatedEndpointList, loading, filterStatus, filterEndpointName]);

  const closeTerminateModal = useCallback(() => {
    setShowTerminateModal(false);
    setTargetEndpoint(null);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
    setTargetEndpoint(null);
  }, []);

  return {
    // State
    isInitialLoad,
    showTerminateModal,
    showDeleteConfirm,
    targetEndpoint,
    // Computed
    isShowGetStarted,
    // Handlers
    handleCreateEndpoint,
    handleTerminate,
    handleDelete,
    handleRedeploy,
    handleWake,
    closeTerminateModal,
    closeDeleteConfirm,
  };
}
