import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, RotateCcw, Loader2 } from "lucide-react";
import { restartLLMDedicatedEndpoint } from "@/api/dedicated-endpoint";
import TerminateEndpointModal from "./TerminateEndpointModal";
import DeleteEndpointConfirm from "./DeleteEndpointConfirm";
import { LLM_DE_STATUS } from "./DEModelStatus";
import styles from "./EndpointOperateBox.module.scss";

export default function EndpointOperateBox({
  endpointId,
  endpointName,
  endpointStatus,
  syncEndpointData,
  goToListPage,
}: {
  endpointId: string;
  endpointName: string;
  endpointStatus: string;
  syncEndpointData: () => Promise<void>;
  goToListPage: () => void;
}) {
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestart = useCallback(async () => {
    try {
      setIsRestarting(true);
      await restartLLMDedicatedEndpoint({
        id: endpointId,
      });
      await syncEndpointData();
    } catch (error) {
      //
    } finally {
      setIsRestarting(false);
    }
  }, [endpointId, syncEndpointData]);

  return (
    <div className="flex items-center gap-2">
      {endpointStatus === LLM_DE_STATUS.TERMINATED ? (
        <Button
          variant="green"
          size="sm"
          onClick={handleRestart}
          disabled={isRestarting}
        >
          {isRestarting ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <RotateCcw className="h-3 w-3 mr-1" />
          )}
          Restart
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTerminateModal(true)}
        >
          Terminate
        </Button>
      )}

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="px-1">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[120px] min-w-[120px] max-w-[120px]"
        >
          <DropdownMenuItem
            className={styles.dropdown_menu_item}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TerminateEndpointModal
        endpointId={endpointId}
        endpointStatus={endpointStatus}
        show={showTerminateModal}
        handleClose={() => setShowTerminateModal(false)}
        syncEndpointData={syncEndpointData}
      />

      <DeleteEndpointConfirm
        endpointId={endpointId}
        endpointName={endpointName}
        show={showDeleteConfirm}
        canDelete={endpointStatus === LLM_DE_STATUS.TERMINATED}
        handleClose={() => setShowDeleteConfirm(false)}
        goToListPage={goToListPage}
      />
    </div>
  );
}
