"use client";

import { useState, useMemo, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import EngineConfig, { EngineConfigValue } from "./form-field/EngineConfig";
import { ENGINE_ARGS_MAP } from "@/constants/llm-dedicated-endpoint";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EngineInfoProps {
  engine: LLMDedicatedEndpointEngine;
  isSuffixDecodingEnable?: boolean;
  handleUpdate: (params: {
    engine?: LLMDedicatedEndpointEngine;
    isSuffixDecodingEnable?: boolean;
  }) => void;
  syncEndpointData: () => Promise<void>;
  isLocked?: boolean;
}

export default function EngineInfo({
  engine,
  isSuffixDecodingEnable,
  handleUpdate,
  syncEndpointData,
  isLocked = false,
}: EngineInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [updatedEngine, setUpdatedEngine] =
    useState<LLMDedicatedEndpointEngine>(engine);
  const [updatedIsSuffixDecodingEnable, setUpdatedIsSuffixDecodingEnable] =
    useState<boolean | undefined>(isSuffixDecodingEnable);

  useEffect(() => {
    if (!isEditing) {
      setUpdatedEngine(engine);
      setUpdatedIsSuffixDecodingEnable(isSuffixDecodingEnable);
    }
  }, [engine, isSuffixDecodingEnable, isEditing]);

  const engineArgsObj = useMemo(() => {
    if (engine.type === "sglang") {
      return ENGINE_ARGS_MAP.sglang;
    }
    return ENGINE_ARGS_MAP.vllm;
  }, [engine.type]);

  const handleEdit = () => {
    setIsEditing(true);
    setUpdatedEngine(engine);
    setUpdatedIsSuffixDecodingEnable(isSuffixDecodingEnable);
  };

  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setIsSaving(true);
    try {
      await handleUpdate({
        engine: updatedEngine,
        isSuffixDecodingEnable: updatedIsSuffixDecodingEnable ?? false,
      });
      await syncEndpointData();
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const onDataChange = (value: EngineConfigValue) => {
    const newEngine: LLMDedicatedEndpointEngine = {
      ...updatedEngine,
      type: value.engineType,
      version: value.engineVersion || "",
      config: {
        maxNumSeqs: value.maxNumSeqs,
      },
    };
    setUpdatedEngine(newEngine);
    setUpdatedIsSuffixDecodingEnable(value.isSuffixDecodingEnable);
  };

  return (
    <>
      <div>
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[14px] font-semibold text-[var(--dark-1)]">
            Engine Configuration
          </h4>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[12px]"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 px-3 text-[12px] bg-[var(--dark-1)] text-white hover:bg-[var(--dark-2)]"
                onClick={handleSaveClick}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Save & Restart Engine
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className={`h-7 px-3 text-[12px] ${isLocked ? "cursor-not-allowed" : ""}`}
              onClick={handleEdit}
              disabled={isLocked}
            >
              Edit
            </Button>
          )}
        </div>

        {/* Warning notice below title when editing */}
        {isEditing && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-[4px] bg-[var(--yellow-6)] mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-[var(--yellow-1)] shrink-0" />
            <p className="font-small text-[var(--yellow-1)]">
              Saving changes will trigger a rolling restart of the engine
            </p>
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <EngineConfig
            value={{
              engineType: updatedEngine.type,
              engineVersion: updatedEngine.version,
              maxNumSeqs: updatedEngine.config?.maxNumSeqs,
              isSuffixDecodingEnable: updatedIsSuffixDecodingEnable,
            }}
            onChange={onDataChange}
            mode="edit"
          />
        ) : (
          <div className="p-4 grid grid-cols-2 gap-4 rounded-[6px] border border-[var(--gray-2)] bg-[var(--gray-4)]">
            <div>
              <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
                {engineArgsObj.maxNumSeqs.displayName}
              </p>
              <p className="font-subtle font-medium text-[var(--dark-1)]">
                {engine.config?.maxNumSeqs || "-"}
              </p>
            </div>
            <div>
              <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
                {engineArgsObj.suffixDecoding.displayName}
              </p>
              <p className="font-subtle font-medium text-[var(--dark-1)]">
                {isSuffixDecodingEnable !== undefined
                  ? isSuffixDecodingEnable
                    ? "On"
                    : "Off"
                  : "-"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart Engine?</AlertDialogTitle>
            <AlertDialogDescription>
              This will trigger a rolling restart of all replicas. The process
              may take a few minutes. During the restart, your endpoint will
              remain available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Confirm & Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
