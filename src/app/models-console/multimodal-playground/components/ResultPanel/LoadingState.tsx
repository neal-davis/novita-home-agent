"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import styles from "./states.module.scss";
interface LoadingStateProps {
  status: "creating" | "polling";
  taskId?: string | null;
  onCancel?: () => void;
}
export const LoadingState = ({
  status,
  taskId,
  onCancel,
}: LoadingStateProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleConfirmCancel = () => {
    setIsDialogOpen(false);
    onCancel?.();
  };
  return (
    <div className={styles.loading_state}>
      <div className={styles.spinner}></div>
      <p className={styles.loading_text}>
        {status === "creating" ? "Submitting task..." : "Generating..."}
      </p>
      {taskId && (
        <p className={styles.task_id}>
          {"Task ID: {taskId}".replace("{taskId}", taskId)}
        </p>
      )}
      {onCancel && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              aria-label={"Cancel"}
              size="sl"
              className="rounded-[4px] mt-9 px-6"
            >
              {"Cancel"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {"Cancellation may still incur charges"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {
                  "Cancelling will stop further processing, but if the task has already entered the generation phase, full charges may still apply. Please confirm before cancelling."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmCancel}>
                {"Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
