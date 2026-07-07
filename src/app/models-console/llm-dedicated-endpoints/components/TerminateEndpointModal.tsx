"use client";

import { useCallback, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { stopLLMDedicatedEndpoint } from "@/api/dedicated-endpoint";
import styles from "./TerminateEndpointModal.module.scss";

export default function TerminateEndpointModal({
  show,
  endpointId,
  endpointStatus,
  handleClose,
  syncEndpointData,
}: {
  show: boolean;
  endpointId: string;
  endpointStatus?: string;
  handleClose: () => void;
  syncEndpointData: () => Promise<void>;
}) {
  const [isTerminating, setIsTerminating] = useState(false);

  const handleConfirm = useCallback(async () => {
    try {
      setIsTerminating(true);
      // Force stop for transitional states (rolling/scaling)
      const needsForce =
        endpointStatus === "rolling" || endpointStatus === "scaling";
      await stopLLMDedicatedEndpoint({
        id: endpointId,
        force: needsForce || undefined,
      });
      await syncEndpointData();
      handleClose();
    } catch (error) {
      //
    } finally {
      setIsTerminating(false);
    }
  }, [endpointId, endpointStatus, handleClose, syncEndpointData]);

  return (
    <Dialog open={show} onOpenChange={isTerminating ? undefined : handleClose}>
      <DialogContent
        className={styles.modal_content}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <h2 className={styles.title}>Terminate endpoint</h2>
        <div className={styles.content}>
          <p className={styles.description}>
            This endpoint will be terminated immediately so future requests will
            fail. You can restart this endpoint any time.
          </p>
          <div className="flex justify-end gap-3 mt-8 mb-1">
            <Button
              variant="outline"
              className="w-[90px]"
              size="sl"
              onClick={handleClose}
              disabled={isTerminating}
            >
              Cancel
            </Button>
            <Button
              size="sl"
              className="px-3"
              variant="warn"
              onClick={handleConfirm}
              disabled={isTerminating}
            >
              {isTerminating ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : null}
              Terminate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
