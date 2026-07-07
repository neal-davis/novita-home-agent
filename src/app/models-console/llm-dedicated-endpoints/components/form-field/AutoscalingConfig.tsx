"use client";

import { useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Info, AlertTriangle } from "lucide-react";
import FormErrorText from "@/components/ui/standard/form-error-text";
import { cn } from "@/lib/utils";
import Tooltip from "@/app/components/Tooltip";
import commonStyles from "../../sub-pages/CreateEndpoint/CreateEndpoint.module.scss";
import styles from "./AutoscalingConfig.module.scss";

export interface AutoscalingConfigValue {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  cooldownPeriod: number;
}

interface AutoscalingConfigProps {
  instanceGPUCount: number;
  value?: AutoscalingConfigValue;
  maxReplicasLimit: number;
  onChange?: (value: AutoscalingConfigValue) => void;
  error?: string;
  mode?: "edit" | "view";
}

export default function AutoscalingConfig({
  instanceGPUCount,
  value = {
    enabled: true,
    minReplicas: 1,
    maxReplicas: 8,
    cooldownPeriod: 300,
  },
  maxReplicasLimit,
  onChange,
  error,
  mode = "view",
}: AutoscalingConfigProps) {
  useEffect(() => {
    if (
      value.maxReplicas > maxReplicasLimit ||
      value.minReplicas > maxReplicasLimit
    ) {
      const adjustedMaxReplicas = Math.min(value.maxReplicas, maxReplicasLimit);
      const adjustedMinReplicas = Math.min(
        value.minReplicas,
        Math.max(maxReplicasLimit - 1, 0),
      );

      const newValue = {
        ...value,
        minReplicas: adjustedMinReplicas,
        maxReplicas: adjustedMaxReplicas,
      };
      onChange?.(newValue);
    }
  }, [maxReplicasLimit, value.maxReplicas, value.minReplicas, value, onChange]);

  const handleChange = (updates: Partial<AutoscalingConfigValue>) => {
    const newValue = { ...value, ...updates };
    onChange?.(newValue);
  };

  // Autoscaling ON: dual thumb slider for min-max range
  const handleRangeSliderChange = (values: number[]) => {
    handleChange({
      minReplicas: values[0],
      maxReplicas: values[1],
    });
  };

  // Autoscaling OFF: single value slider
  const handleSingleSliderChange = (values: number[]) => {
    handleChange({
      minReplicas: values[0],
      maxReplicas: values[0],
    });
  };

  // Check if Scale-to-Zero warning should show (min = 0 when autoscaling is ON)
  const showScaleToZeroWarning = value.enabled && value.minReplicas === 0;

  // Generate all slider marks (OFF state: 1 to max, ON state: 0 to max)
  const sliderMarksOff = useMemo(() => {
    return Array.from({ length: maxReplicasLimit }, (_, i) => i + 1);
  }, [maxReplicasLimit]);

  const sliderMarksOn = useMemo(() => {
    return Array.from({ length: maxReplicasLimit + 1 }, (_, i) => i);
  }, [maxReplicasLimit]);

  return (
    <div>
      {/* Card Container */}
      <div className="rounded-[6px] border border-[var(--gray-2)]">
        {/* Header with Toggle - with background and bottom border */}
        <div className="flex items-center justify-between p-4 bg-[var(--gray-4)] rounded-t-[6px] border-b border-[var(--gray-2)]">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[var(--dark-1)]">
              Autoscaling
            </p>
            <p className="text-[12px] text-[var(--dark-3)] mt-1 leading-[16px]">
              Autoscaling handles highly variable traffic while minimizing spend
              on idle compute resources.
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <Switch
              className={styles.switch}
              size="sm"
              checked={value.enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleChange({
                    enabled: true,
                    minReplicas: 1,
                    maxReplicas: Math.min(8, maxReplicasLimit),
                    cooldownPeriod: 300,
                  });
                } else {
                  handleChange({
                    enabled: false,
                    minReplicas: 1,
                    maxReplicas: 1,
                  });
                }
              }}
            />
            <span className="text-[12px] text-[var(--dark-2)] w-6">
              {value.enabled ? "On" : "Off"}
            </span>
          </div>
        </div>

        {/* Content based on toggle state - no background */}
        <div className="p-4">
          {/* Autoscaling OFF */}
          {!value.enabled && (
            <>
              {/* Title row with value */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px] font-medium text-[var(--dark-1)]">
                  Number of replicas:
                </span>
                <span className="text-[13px] font-medium text-[var(--brand-0)]">
                  {value.minReplicas || 1}
                </span>
                <Tooltip
                  content="The fixed number of replicas that will always be running."
                  contentClassName="w-[240px] whitespace-normal"
                >
                  <Info className="w-3 h-3 text-[var(--dark-3)]" />
                </Tooltip>
              </div>

              {/* Single thumb slider */}
              <Slider
                value={[value.minReplicas || 1]}
                onValueChange={handleSingleSliderChange}
                max={maxReplicasLimit}
                min={1}
                step={1}
                className={styles.slider}
              />
              <div className="flex justify-between mt-1.5 text-[11px] text-[var(--dark-3)]">
                {sliderMarksOff.map((mark) => (
                  <span key={mark}>{mark}</span>
                ))}
              </div>
            </>
          )}

          {/* Autoscaling ON */}
          {value.enabled && (
            <div className="flex gap-4">
              {/* Left: Replica Range - 80% */}
              <div className="w-[80%]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] font-medium text-[var(--dark-1)]">
                    Replica Range:
                  </span>
                  <span className="text-[13px] font-medium text-[var(--brand-0)]">
                    Min: {value.minReplicas} ~ Max: {value.maxReplicas}
                  </span>
                  <Tooltip
                    content="Set the minimum and maximum number of replicas. The system will automatically scale between these values based on traffic."
                    contentClassName="w-[280px] whitespace-normal"
                  >
                    <Info className="w-3 h-3 text-[var(--dark-3)]" />
                  </Tooltip>
                </div>

                {/* Dual thumb slider */}
                <Slider
                  value={[value.minReplicas, value.maxReplicas]}
                  onValueChange={handleRangeSliderChange}
                  max={maxReplicasLimit}
                  min={0}
                  step={1}
                  className={styles.slider}
                />
                <div className="flex justify-between mt-1.5 text-[11px] text-[var(--dark-3)]">
                  {sliderMarksOn.map((mark) => (
                    <span key={mark}>{mark}</span>
                  ))}
                </div>

                {/* Scale-to-Zero Warning */}
                {showScaleToZeroWarning && (
                  <div className="flex items-start gap-2 p-3 rounded-[6px] bg-[var(--orange-7)] border border-[var(--orange-5)] mt-3">
                    <AlertTriangle className="w-4 h-4 text-[var(--orange-1)] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-[var(--orange-1)]">
                        Scale-to-Zero is enabled
                      </p>
                      <p className="text-[12px] text-[var(--orange-2)] mt-0.5">
                        Your endpoint has a default minimum of 1 replica and
                        will automatically sleep when idle. Cold start time
                        depends on your model size, and typically takes a few
                        minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Scale-down Delay - 20% with left border */}
              <div className="w-[20%] pl-4 border-l border-[var(--gray-2)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[13px] font-medium text-[var(--dark-1)]">
                    Scale-down Delay:
                  </span>
                  <Tooltip
                    content="The time to wait before scaling down after traffic decreases."
                    contentClassName="w-[260px] whitespace-normal"
                  >
                    <Info className="w-3 h-3 text-[var(--dark-3)]" />
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min={300}
                    value={value.cooldownPeriod.toString()}
                    onChange={(e) => {
                      const num = Number(e.target.value);
                      handleChange({
                        cooldownPeriod: Number.isNaN(num) ? 300 : num,
                      });
                    }}
                    className={cn("w-full h-8 pr-[50px] text-[13px]", {
                      [commonStyles.input_error]: error,
                    })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--dark-3)] pointer-events-none">
                    sec
                  </span>
                </div>
                <p className="text-[11px] text-[var(--dark-3)] mt-1">
                  Min: 300s
                </p>
                <FormErrorText error={error} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
