"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import FormErrorText from "@/components/ui/standard/form-error-text";
import { ENGINE_ARGS_MAP } from "@/constants/llm-dedicated-endpoint";
import { cn } from "@/lib/utils";
import Tooltip from "@/app/components/Tooltip";
import styles from "./EngineConfig.module.scss";

export interface EngineConfigValue {
  engineType: string;
  engineVersion?: string;
  maxNumSeqs?: number;
  isSuffixDecodingEnable?: boolean;
}

interface EngineConfigProps {
  value: EngineConfigValue;
  onChange?: (value: EngineConfigValue) => void;
  error?: string;
  mode?: "edit" | "view";
  recommendedConcurrency?: number;
}

export const DEFAULT_RECOMMENDED_CONCURRENCY = 16;

export default function EngineConfig({
  value,
  onChange,
  error,
  mode = "view",
  recommendedConcurrency = DEFAULT_RECOMMENDED_CONCURRENCY,
}: EngineConfigProps) {
  const engineArgsObj = useMemo(() => {
    if (value.engineType === "sglang") {
      return ENGINE_ARGS_MAP.sglang;
    }
    return ENGINE_ARGS_MAP.vllm;
  }, [value.engineType]);

  const handleChange = (updates: Partial<EngineConfigValue>) => {
    const newValue = { ...value, ...updates };
    onChange?.(newValue);
  };

  // Validate positive integer for maxNumSeqs
  const handleConcurrencyChange = (inputValue: string) => {
    const num = parseInt(inputValue, 10);
    // Only accept positive integers
    if (!Number.isNaN(num) && num >= 1) {
      handleChange({ maxNumSeqs: num });
    } else if (inputValue === "") {
      handleChange({ maxNumSeqs: undefined });
    }
  };

  // Get hint message based on current value vs recommended
  const getConcurrencyHint = () => {
    const currentValue = value.maxNumSeqs;
    if (!currentValue) return null;

    const hints = engineArgsObj.maxNumSeqs.hints;
    if (currentValue < recommendedConcurrency) {
      return { type: "warning", message: hints.belowRecommended };
    } else if (currentValue > recommendedConcurrency) {
      return { type: "warning", message: hints.aboveRecommended };
    }
    return { type: "success", message: hints.optimal };
  };

  const concurrencyHint = getConcurrencyHint();

  return (
    <div>
      {/* Card Container */}
      <div className="rounded-[6px] border border-[var(--gray-2)]">
        {/* Max Concurrency per Replica Section */}
        <div className="p-4 border-b border-[var(--gray-2)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-medium text-[var(--dark-1)]">
              {engineArgsObj.maxNumSeqs.displayName}
            </span>
            <Tooltip
              content={engineArgsObj.maxNumSeqs.description}
              contentClassName="w-[280px] whitespace-normal"
            >
              <Info className="w-3 h-3 text-[var(--dark-3)]" />
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              step={1}
              value={value.maxNumSeqs ?? ""}
              onChange={(e) => handleConcurrencyChange(e.target.value)}
              onKeyDown={(e) => {
                // Prevent decimal point, minus sign, and 'e' for scientific notation
                if (
                  e.key === "." ||
                  e.key === "-" ||
                  e.key === "e" ||
                  e.key === "E"
                ) {
                  e.preventDefault();
                }
              }}
              className="w-[200px] h-8 text-[13px]"
            />
            <span className="text-[12px] text-[var(--dark-3)]">
              Recommended:{" "}
              <span className="text-[var(--brand-0)] font-medium">
                {recommendedConcurrency}
              </span>
            </span>
          </div>
          {/* Hint message */}
          {concurrencyHint && (
            <p
              className={cn("text-[11px] mt-1.5", {
                "text-[var(--orange-1)]": concurrencyHint.type === "warning",
                "text-[var(--brand-0)]": concurrencyHint.type === "success",
              })}
            >
              {concurrencyHint.message}
            </p>
          )}
        </div>

        {/* Suffix Decoding Section */}
        <div className="flex items-center justify-between p-4 bg-[var(--gray-4)] rounded-b-[6px]">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[var(--dark-1)]">
              {engineArgsObj.suffixDecoding.displayName}
            </p>
            <p className="text-[12px] text-[var(--dark-3)] mt-1 leading-[16px]">
              {engineArgsObj.suffixDecoding.description}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 shrink-0">
            <Switch
              className={styles.switch}
              size="sm"
              checked={value.isSuffixDecodingEnable || false}
              onCheckedChange={(checked) =>
                handleChange({ isSuffixDecodingEnable: checked })
              }
            />
            <span className="text-[12px] text-[var(--dark-2)] w-6">
              {value.isSuffixDecodingEnable ? "On" : "Off"}
            </span>
          </div>
        </div>
      </div>
      <FormErrorText error={error} />
    </div>
  );
}
