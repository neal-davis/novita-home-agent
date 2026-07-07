"use client";

import { useCallback, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2 } from "lucide-react";
import { deleteLLMDedicatedEndpoint } from "@/api/dedicated-endpoint";
import styles from "./DeleteEndpointConfirm.module.scss";

export default function DeleteEndpointConfirm({
  show,
  endpointId,
  canDelete,
  endpointName,
  handleClose,
  goToListPage,
}: {
  show: boolean;
  endpointId: string;
  endpointName: string;
  canDelete: boolean;
  handleClose: () => void;
  goToListPage: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    try {
      setIsDeleting(true);
      await deleteLLMDedicatedEndpoint({
        id: endpointId,
      });
      handleClose();
      setTimeout(() => {
        goToListPage();
      }, 500);
    } catch (error) {
      //
    } finally {
      setIsDeleting(false);
    }
  }, [endpointId, handleClose, goToListPage]);

  return (
    <Dialog open={show} onOpenChange={isDeleting ? undefined : handleClose}>
      <DialogContent
        className={styles.modal_content}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <h2 className={styles.title}>Delete endpoint</h2>
        <div className={styles.content}>
          {!canDelete && (
            <p className={styles.description}>
              Please terminate the endpoint before deleting
            </p>
          )}
          {canDelete && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-[4px] bg-[var(--red-6)] border border-[var(--red-4)]">
                <AlertCircle className="w-3.5 h-3.5 text-[var(--red-1)] shrink-0" />
                <p className="font-small text-[var(--red-1)]">
                  This action cannot be undone. This will permanently delete
                  this endpoint.
                </p>
              </div>
              <p className={styles.input_description}>
                <span>Please type</span>
                <span className={styles.highlight}>{endpointName}</span>
                <span>to confirm</span>
              </p>
              <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter endpoint name"
                className="mt-2 h-[36px]"
              />
            </>
          )}
          {canDelete ? (
            <div className="flex justify-end gap-3 mt-8 mb-1">
              <Button
                variant="outline"
                className="w-[90px]"
                size="sl"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                size="sl"
                className="px-3"
                variant="warn"
                onClick={handleConfirm}
                disabled={isDeleting || inputValue !== endpointName}
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Delete
              </Button>
            </div>
          ) : (
            <div className="flex justify-end gap-3 mt-8 mb-1">
              <Button
                variant="secondary"
                className="w-[90px]"
                size="sl"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
