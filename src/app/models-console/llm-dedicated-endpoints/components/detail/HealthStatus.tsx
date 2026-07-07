"use client";

import { useMemo } from "react";
import { LLM_DE_STATUS } from "../DEModelStatus";
import { cn } from "@/lib/utils";

interface HealthStatusProps {
  status: string;
  phase?: string;
}

// Health display configuration - semantic colors only, no icons
function createHealthConfig(): Record<
  string,
  {
    label: string;
    subtitle: string;
    labelColor: string;
  }
> {
  return {
    [LLM_DE_STATUS.RUNNING]: {
      label: "Healthy",
      subtitle: "All systems operational",
      labelColor: "text-[var(--brand-0)]", // Green for healthy
    },
    [LLM_DE_STATUS.FAILED]: {
      label: "Failed",
      subtitle: "Deployment failed. Check logs or redeploy.",
      labelColor: "text-[var(--red-1)]", // Red for failed
    },
    [LLM_DE_STATUS.TERMINATED]: {
      label: "Terminated",
      subtitle: "Endpoint terminated. Redeploy to restart.",
      labelColor: "text-[var(--dark-2)]", // Gray for terminated
    },
    [LLM_DE_STATUS.SLEEPING]: {
      label: "Sleeping",
      subtitle: "Scale-to-Zero active. Will wake on first request.",
      labelColor: "text-[var(--purple-1)]", // Purple for sleeping
    },
    [LLM_DE_STATUS.DEPLOYING]: {
      label: "Deploying",
      subtitle: "Initial deployment in progress...",
      labelColor: "text-[var(--cyan-2)]", // Cyan for deploying
    },
    [LLM_DE_STATUS.PENDING]: {
      label: "Pending",
      subtitle: "Waiting for resources...",
      labelColor: "text-[var(--dark-2)]", // Gray for pending
    },
    [LLM_DE_STATUS.ROLLING]: {
      label: "Rolling",
      subtitle: "Rolling update in progress...",
      labelColor: "text-[var(--cyan-2)]", // Cyan for rolling
    },
    [LLM_DE_STATUS.SCALING]: {
      label: "Scaling",
      subtitle: "Autoscaling in progress...",
      labelColor: "text-[var(--cyan-2)]", // Cyan for scaling
    },
    [LLM_DE_STATUS.TERMINATING]: {
      label: "Terminating",
      subtitle: "Endpoint is shutting down...",
      labelColor: "text-[var(--yellow-1)]", // Yellow for terminating
    },
  };
}

export default function HealthStatus({ status, phase }: HealthStatusProps) {
  const healthConfig = createHealthConfig();
  const config = healthConfig[status] || healthConfig[LLM_DE_STATUS.PENDING];

  // Update subtitle for deploying phases
  const subtitle = useMemo(() => {
    if (status === LLM_DE_STATUS.DEPLOYING && phase) {
      const phaseText: Record<string, string> = {
        requesting_gpu: "Requesting GPU resources...",
        downloading_model: "Downloading model weights...",
        engine_initializing: "Initializing inference engine...",
      };
      return phaseText[phase] || config.subtitle;
    }
    return config.subtitle;
  }, [status, phase, config.subtitle]);

  return (
    <div className="p-4 rounded-[6px] border border-[var(--gray-2)]">
      <p className="text-[11px] font-semibold text-[var(--dark-2)] uppercase tracking-[0.5px] mb-1">
        Health
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className={cn("text-[22px] font-extrabold", config.labelColor)}>
          {config.label}
        </span>
      </div>
      <p className="font-small text-[var(--dark-3)] mt-1">{subtitle}</p>
    </div>
  );
}
