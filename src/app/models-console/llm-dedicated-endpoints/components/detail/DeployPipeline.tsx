"use client";

import {
  CheckCircle2,
  Loader2,
  Circle,
  Monitor,
  Download,
  Zap,
  Shield,
} from "lucide-react";
import { LLM_DE_STATUS } from "../DEModelStatus";
import { cn } from "@/lib/utils";

interface DeployPipelineProps {
  status: string;
  phase?: string;
}

// Pipeline stages based on PRD 5.2.3
function createPipelineStages() {
  return [
    { key: "requesting_gpu", label: "Resource Scheduling", icon: Monitor },
    { key: "downloading_model", label: "Model & Image Pull", icon: Download },
    { key: "engine_initializing", label: "Engine Startup", icon: Zap },
    { key: "health_check", label: "Running", icon: Shield },
  ];
}

// Show deploy pipeline only in these states (过渡态)
const SHOW_PIPELINE_STATES = [
  LLM_DE_STATUS.PENDING,
  LLM_DE_STATUS.DEPLOYING,
  LLM_DE_STATUS.ROLLING,
  LLM_DE_STATUS.SCALING,
];

export default function DeployPipeline({ status, phase }: DeployPipelineProps) {
  const showPipeline = SHOW_PIPELINE_STATES.includes(status);
  const pipelineStages = createPipelineStages();
  const currentStageIndex =
    status === LLM_DE_STATUS.PENDING
      ? -1
      : phase
        ? pipelineStages.findIndex((s) => s.key === phase)
        : 0;

  if (!showPipeline) {
    return null;
  }

  return (
    <div className="p-5 rounded-[8px] border border-[var(--gray-2)] bg-white">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-[14px] font-semibold text-[var(--dark-1)]">
          Deployment Pipeline
        </h4>
        <span className="text-[12px] text-[var(--dark-2)]">
          {status === LLM_DE_STATUS.PENDING
            ? "Waiting..."
            : `Step ${currentStageIndex + 1} of ${pipelineStages.length}`}
        </span>
      </div>

      {/* Pipeline steps row */}
      <div className="flex items-start relative px-2">
        {pipelineStages.map((stage, index) => {
          const isComplete = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.key}
              className="flex-1 flex flex-col items-center relative"
            >
              {/* Icon circle */}
              <div
                className={cn(
                  "w-[44px] h-[44px] rounded-full flex items-center justify-center border-[3px] relative z-[1] transition-all duration-400",
                  isComplete &&
                    "border-[var(--dark-1)] bg-[var(--dark-1)] text-white",
                  isCurrent &&
                    "border-[var(--brand-0)] bg-[var(--brand-3)] text-[var(--brand-0)] animate-pulse",
                  isPending &&
                    "border-[var(--gray-2)] bg-[var(--gray-3)] text-[var(--dark-3)]",
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <StageIcon className="w-5 h-5" />
                )}
              </div>

              {/* Connector line between steps */}
              {index < pipelineStages.length - 1 && (
                <div className="absolute top-[22px] left-[calc(50%+26px)] right-[calc(-50%+26px)] h-[3px] bg-[var(--gray-2)] rounded-[2px] overflow-hidden z-0">
                  <div
                    className={cn(
                      "h-full rounded-[2px] transition-[width] duration-500 ease-in-out",
                      isComplete && "w-full bg-[var(--dark-1)]",
                      isCurrent && "w-[40%] bg-[var(--brand-0)] animate-pulse",
                      isPending && "w-0",
                    )}
                  />
                </div>
              )}

              {/* Label */}
              <span
                className={cn(
                  "mt-2.5 text-[12px] font-semibold text-center transition-colors",
                  isComplete && "text-[var(--dark-1)]",
                  isCurrent && "text-[var(--brand-0)] font-bold",
                  isPending && "text-[var(--dark-3)]",
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
