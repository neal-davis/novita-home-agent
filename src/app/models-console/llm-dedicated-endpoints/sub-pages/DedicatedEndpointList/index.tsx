"use client";

import GetStarted from "../../components/GetStarted";
import DEModelCard from "../../components/DEModelCard";
import TerminateEndpointModal from "../../components/TerminateEndpointModal";
import DeleteEndpointConfirm from "../../components/DeleteEndpointConfirm";
import { NoData } from "@/components/ui/standard/no-data";
import { LLM_DE_STATUS } from "../../components/DEModelStatus";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { useDedicatedEndpointList } from "./useDedicatedEndpointList";
import { ListSkeleton } from "./ListSkeleton";
import { ListToolbar } from "./ListToolbar";

interface DedicatedEndpointListProps {
  goToCreateEndpoint: () => void;
  goToDetail: (endpoint: LLMDedicatedEndpoint, tab?: string) => void;
  dedicatedEndpointList: LLMDedicatedEndpoint[];
  totalCount: number;
  loading: boolean;
  filterStatus: string;
  filterEndpointName: string;
  onStatusChange: (value: string) => void;
  onEndpointNameChange: (value: string) => void;
  refreshList: () => void;
}

export default function DedicatedEndpointList({
  goToCreateEndpoint,
  goToDetail,
  dedicatedEndpointList,
  totalCount,
  loading,
  filterStatus,
  filterEndpointName,
  onStatusChange,
  onEndpointNameChange,
  refreshList,
}: DedicatedEndpointListProps) {
  const list = useDedicatedEndpointList({
    dedicatedEndpointList,
    loading,
    filterStatus,
    filterEndpointName,
    refreshList,
    goToCreateEndpoint,
  });

  // Initial loading state - skeleton
  if (list.isInitialLoad) {
    return <ListSkeleton />;
  }

  // New user: show creation guide
  if (list.isShowGetStarted) {
    return (
      <GetStarted
        goToCreateEndpoint={() => {
          list.handleCreateEndpoint();
          analytics.trackClick(
            CLICK_BTN_IDs.MODELS_CONSOLE.LLM_DE_CREATE_ENDPOINT_ENTRY,
            { position: "get-started" },
          );
        }}
      />
    );
  }

  // Existing user: full-width list with toolbar
  return (
    <div>
      <ListToolbar
        dedicatedEndpointList={dedicatedEndpointList}
        totalCount={totalCount}
        filterStatus={filterStatus}
        filterEndpointName={filterEndpointName}
        onStatusChange={onStatusChange}
        onEndpointNameChange={onEndpointNameChange}
        onCreateEndpoint={list.handleCreateEndpoint}
      />

      {/* Card list */}
      {dedicatedEndpointList.length > 0 ? (
        <div className="flex flex-col gap-2">
          {dedicatedEndpointList.map((item) => (
            <DEModelCard
              key={item.id}
              data={item}
              onClick={() => goToDetail(item)}
              onRedeploy={list.handleRedeploy}
              onDelete={list.handleDelete}
              onPause={list.handleTerminate}
              onWake={list.handleWake}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-16">
          <NoData title="No endpoints match your filters" />
        </div>
      )}

      {/* Terminate confirmation modal */}
      {list.targetEndpoint && (
        <TerminateEndpointModal
          endpointId={list.targetEndpoint.id}
          endpointStatus={list.targetEndpoint.status}
          show={list.showTerminateModal}
          handleClose={list.closeTerminateModal}
          syncEndpointData={async () => {
            refreshList();
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {list.targetEndpoint && (
        <DeleteEndpointConfirm
          endpointId={list.targetEndpoint.id}
          endpointName={list.targetEndpoint.name}
          show={list.showDeleteConfirm}
          canDelete={[LLM_DE_STATUS.TERMINATED, LLM_DE_STATUS.FAILED].includes(
            list.targetEndpoint.status,
          )}
          handleClose={list.closeDeleteConfirm}
          goToListPage={refreshList}
        />
      )}
    </div>
  );
}
