"use client";

import { useCallback, useMemo, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import {
  OverviewTab,
  MetricsTab,
  SettingsTab,
  DeployPipeline,
} from "../../components/detail";
import TerminateEndpointModal from "../../components/TerminateEndpointModal";
import DeleteEndpointConfirm from "../../components/DeleteEndpointConfirm";
import AddAdapterModal from "../../components/AddAdapterModal";
import type { LoraAdapterItem } from "../../components/form-field/validation";
import { useDedicatedEndpointDetail } from "./useDedicatedEndpointDetail";
import { DedicatedEndpointHeader } from "./DedicatedEndpointHeader";
import styles from "./DedicatedEndpointDetail.module.scss";

function createTabs() {
  return [
    { value: "overview", label: "Overview" },
    { value: "metrics", label: "Metrics" },
    { value: "settings", label: "Settings" },
  ];
}

interface DedicatedEndpointDetailProps {
  goToListPage: () => void;
  endpointData: LLMDedicatedEndpoint;
  syncEndpointData: () => Promise<void>;
  initialTab?: string;
}

export default function DedicatedEndpointDetail({
  goToListPage,
  endpointData,
  syncEndpointData,
  initialTab = "overview",
}: DedicatedEndpointDetailProps) {
  const detail = useDedicatedEndpointDetail({
    endpointData,
    syncEndpointData,
    initialTab,
  });
  const tabs = createTabs();

  const [showLoraModal, setShowLoraModal] = useState(false);
  const [savingLora, setSavingLora] = useState(false);

  const provider = useMemo<"huggingface" | "novita">(() => {
    return endpointData.baseModel?.provider === "self_hosting"
      ? "novita"
      : "huggingface";
  }, [endpointData.baseModel?.provider]);

  const loraItems = useMemo<LoraAdapterItem[]>(
    () =>
      (endpointData.loras || []).map((l) => ({
        modelId: l.modelId,
        modelAlias: l.name,
      })),
    [endpointData.loras],
  );

  const handleSaveLoras = useCallback(
    async (items: LoraAdapterItem[]) => {
      setSavingLora(true);
      try {
        // Preserve provider/token/revision from existing entries when present;
        // new entries inherit the base model's provider/token.
        const existingByModelId = new Map(
          (endpointData.loras || []).map((l) => [l.modelId, l]),
        );
        const nextLoras: LLMDedicatedEndpointLora[] = items.map((item) => {
          const existing = existingByModelId.get(item.modelId);
          const name = item.modelAlias || undefined;
          if (existing) {
            return {
              modelId: existing.modelId,
              provider: existing.provider,
              name,
              revision: existing.revision,
              token: existing.token,
            };
          }
          return {
            provider: provider === "novita" ? "self_hosting" : "huggingface",
            modelId: item.modelId,
            ...(name && { name }),
            ...(provider !== "novita" && endpointData.baseModel?.token
              ? { token: endpointData.baseModel.token }
              : {}),
          };
        });
        await detail.handleUpdate({ loras: nextLoras });
        await syncEndpointData();
        message.success("LoRA adapters updated");
      } catch (error) {
        console.error("Failed to update LoRA adapters:", error);
        message.error("Failed to update LoRA adapters");
        throw error;
      } finally {
        setSavingLora(false);
      }
    },
    [
      detail,
      endpointData.loras,
      endpointData.baseModel?.token,
      provider,
      syncEndpointData,
    ],
  );

  const openLoraModal = useCallback(() => setShowLoraModal(true), []);

  return (
    <div className={styles.detail_page}>
      {/* Top Section: Info + Actions + Back */}
      <DedicatedEndpointHeader
        endpointData={endpointData}
        modelDisplayName={detail.modelDisplayName}
        formattedCreateTime={detail.formattedCreateTime}
        primaryActions={detail.primaryActions}
        canTerminate={detail.canTerminate}
        canDelete={detail.canDelete}
        canPlayground={detail.canPlayground}
        onBack={goToListPage}
        onTerminate={() => detail.setShowTerminateModal(true)}
        onDelete={() => detail.setShowDeleteConfirm(true)}
      />

      {/* Deploy Pipeline - shows during deployment, auto-hides when complete */}
      <DeployPipeline status={endpointData.status} phase={endpointData.phase} />

      {/* Bottom Section: Tabs + Content */}
      <div className={styles.bottom_section}>
        {/* Tabs bar */}
        <div className={styles.tabs_bar}>
          <div className={styles.tabs_list} ref={detail.tabsRef}>
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                data-tab={tab.value}
                className={`${styles.tab_trigger} ${detail.activeTab === tab.value ? styles.active : ""}`}
                onClick={() => detail.setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
            {/* Sliding indicator */}
            <div
              className={styles.tab_indicator}
              style={{
                left: detail.indicatorStyle.left,
                width: detail.indicatorStyle.width,
              }}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tab_content_wrapper}>
          {detail.activeTab === "overview" && (
            <OverviewTab
              endpointData={endpointData}
              onSwitchTab={detail.setActiveTab}
              onEditLora={openLoraModal}
              changeHistoryRecords={detail.changeHistoryRecords}
              isChangeHistoryLoading={detail.isChangeHistoryLoading}
            />
          )}

          {detail.activeTab === "metrics" && (
            <MetricsTab
              status={endpointData.status}
              endpointId={endpointData.id}
            />
          )}

          {detail.activeTab === "settings" && (
            <SettingsTab
              endpointData={endpointData}
              handleUpdate={detail.handleUpdate}
              syncEndpointData={syncEndpointData}
              onEditLora={openLoraModal}
              changeHistoryRecords={detail.changeHistoryRecords}
              changeHistoryTotal={detail.changeHistoryTotal}
              isChangeHistoryLoading={detail.isChangeHistoryLoading}
              isChangeHistoryLoadingMore={detail.isChangeHistoryLoadingMore}
              loadMoreChangeHistory={detail.loadMoreChangeHistory}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <TerminateEndpointModal
        endpointId={endpointData.id}
        endpointStatus={endpointData.status}
        show={detail.showTerminateModal}
        handleClose={() => detail.setShowTerminateModal(false)}
        syncEndpointData={syncEndpointData}
      />

      <DeleteEndpointConfirm
        endpointId={endpointData.id}
        endpointName={endpointData.name}
        show={detail.showDeleteConfirm}
        canDelete={detail.canDelete}
        handleClose={() => detail.setShowDeleteConfirm(false)}
        goToListPage={goToListPage}
      />

      {showLoraModal && (
        <AddAdapterModal
          show={showLoraModal}
          title="Edit LoRA adapters"
          onClose={() => setShowLoraModal(false)}
          loraAdapters={loraItems}
          baseModel={endpointData.baseModel?.modelId || ""}
          token={endpointData.baseModel?.token}
          provider={provider}
          saving={savingLora}
          onAdapterSave={handleSaveLoras}
        />
      )}
    </div>
  );
}
