"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import AutoscalingConfig, {
  AutoscalingConfigValue,
} from "./form-field/AutoscalingConfig";
import { Loader2, Clock, AlertTriangle } from "lucide-react";
import { createAutoscalingSchema } from "./form-field/validation";
import * as z from "zod";

const COOLDOWN_DURATION = 5 * 60; // 5 minutes in seconds

interface AutoscalingInfoProps {
  scalingPolicy: LLMDedicatedEndpointScalingPolicy;
  singleInstanceGpuNum: number;
  endpointName: string; // Used for localStorage key
  handleUpdate: (scalingPolicy: LLMDedicatedEndpointScalingPolicy) => void;
  syncEndpointData: () => Promise<void>;
  isLocked?: boolean;
}

export default function AutoscalingInfo({
  scalingPolicy,
  singleInstanceGpuNum,
  endpointName,
  handleUpdate,
  syncEndpointData,
  isLocked = false,
}: AutoscalingInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [updatedScalingPolicy, setUpdatedScalingPolicy] =
    useState<LLMDedicatedEndpointScalingPolicy>(scalingPolicy);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const maxReplicasLimit = 8;
  const cooldownKey = `autoscaling_cooldown_${endpointName}`;

  // Format seconds to mm:ss
  const formatCooldown = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Check cooldown on mount and start interval
  useEffect(() => {
    const checkCooldown = () => {
      const storedEndTime = localStorage.getItem(cooldownKey);
      if (storedEndTime) {
        const endTime = parseInt(storedEndTime, 10);
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        // Only update state if value changed to avoid unnecessary re-renders
        setCooldownRemaining((prev) => (prev !== remaining ? remaining : prev));
        if (remaining === 0) {
          localStorage.removeItem(cooldownKey);
        }
      } else {
        // Clear cooldown if no stored value
        setCooldownRemaining((prev) => (prev !== 0 ? 0 : prev));
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [cooldownKey]);

  useEffect(() => {
    if (!isEditing) {
      setUpdatedScalingPolicy(scalingPolicy);
    }
  }, [scalingPolicy, isEditing]);

  const validateAutoscalingData = (data: AutoscalingConfigValue): string => {
    try {
      createAutoscalingSchema().parse(data);
      return "";
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || "Validation failed";
      }
      return "Validation failed";
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setValidationError("");
    setUpdatedScalingPolicy(scalingPolicy);
  };

  const handleSave = async () => {
    const currentValue: AutoscalingConfigValue = {
      enabled: updatedScalingPolicy.enable,
      minReplicas: updatedScalingPolicy.minReplicas,
      maxReplicas: updatedScalingPolicy.maxReplicas,
      cooldownPeriod: updatedScalingPolicy.coolDownPeriod,
    };

    const error = validateAutoscalingData(currentValue);
    setValidationError(error);

    if (error) {
      return;
    }

    setIsSaving(true);
    try {
      await handleUpdate(updatedScalingPolicy);
      await syncEndpointData();
      // Start 5-minute cooldown
      const endTime = Date.now() + COOLDOWN_DURATION * 1000;
      localStorage.setItem(cooldownKey, endTime.toString());
      setCooldownRemaining(COOLDOWN_DURATION);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const onDataChange = (value: AutoscalingConfigValue) => {
    const newScalingPolicy: LLMDedicatedEndpointScalingPolicy = {
      enable: value.enabled,
      minReplicas: value.minReplicas,
      maxReplicas: value.maxReplicas,
      coolDownPeriod: value.cooldownPeriod,
      scaleDownWindow: updatedScalingPolicy.scaleDownWindow,
      stableWindow: updatedScalingPolicy.stableWindow,
    };
    setUpdatedScalingPolicy(newScalingPolicy);

    const error = validateAutoscalingData(value);
    setValidationError(error);
  };

  return (
    <div>
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[14px] font-semibold text-[var(--dark-1)]">
          Autoscaling Configuration
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
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={`h-7 px-3 text-[12px] ${isLocked || cooldownRemaining > 0 ? "cursor-not-allowed" : ""}`}
            onClick={handleEdit}
            disabled={isLocked || cooldownRemaining > 0}
          >
            {cooldownRemaining > 0 ? (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Edit ({formatCooldown(cooldownRemaining)})
              </>
            ) : (
              "Edit"
            )}
          </Button>
        )}
      </div>

      {/* Warning notice below title when editing */}
      {isEditing && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-[4px] bg-[var(--yellow-6)] mb-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[var(--yellow-1)] shrink-0" />
          <p className="font-small text-[var(--yellow-1)]">
            Autoscaling changes take effect within 5 minutes
          </p>
        </div>
      )}

      {/* Content */}
      {isEditing ? (
        <AutoscalingConfig
          instanceGPUCount={singleInstanceGpuNum}
          value={{
            enabled: updatedScalingPolicy.enable,
            minReplicas: updatedScalingPolicy.minReplicas,
            maxReplicas: updatedScalingPolicy.maxReplicas,
            cooldownPeriod: updatedScalingPolicy.coolDownPeriod,
          }}
          maxReplicasLimit={maxReplicasLimit}
          onChange={onDataChange}
          mode="edit"
          error={validationError}
        />
      ) : (
        <div className="p-4 rounded-[6px] border border-[var(--gray-2)] bg-[var(--gray-4)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
                Min Replicas
              </p>
              <p className="font-subtle font-medium text-[var(--dark-1)]">
                {scalingPolicy.minReplicas}
              </p>
            </div>

            <div>
              <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
                Max Replicas
              </p>
              <p className="font-subtle font-medium text-[var(--dark-1)]">
                {scalingPolicy.maxReplicas}
              </p>
            </div>

            <div>
              <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
                Scale-down Delay
              </p>
              <p className="font-subtle font-medium text-[var(--dark-1)]">
                {scalingPolicy.coolDownPeriod}s
              </p>
            </div>

            <div>
              <p className="font-small text-[var(--dark-3)] uppercase tracking-[0.5px] mb-1">
                Scale-to-Zero
              </p>
              <p className="font-subtle font-medium text-[var(--dark-1)]">
                {scalingPolicy.minReplicas === 0 ? "Enabled" : "Disabled"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
