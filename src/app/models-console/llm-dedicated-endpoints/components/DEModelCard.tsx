"use client";

import { useMemo, useState } from "react";
import { Cpu, Layers, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LLM_DE_STATUS } from "./DEModelStatus";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import styles from "./DEModelCard.module.scss";

interface DEModelCardProps {
  data: LLMDedicatedEndpoint;
  onClick?: () => void;
  onRedeploy?: (endpoint: LLMDedicatedEndpoint) => void;
  onDelete?: (endpoint: LLMDedicatedEndpoint) => void;
  onPause?: (endpoint: LLMDedicatedEndpoint) => void;
  onWake?: (endpoint: LLMDedicatedEndpoint) => void;
}

// States that show pulsing status dot (transitioning states / 过渡态)
const PULSING_STATES = [
  LLM_DE_STATUS.PENDING,
  LLM_DE_STATUS.DEPLOYING,
  LLM_DE_STATUS.ROLLING,
  LLM_DE_STATUS.SCALING,
  LLM_DE_STATUS.TERMINATING,
];

// Status tag style mapping (using project color variables)
// 过渡态 (transitioning) 统一用灰色标签
const STATUS_TAG_STYLES: Record<string, string> = {
  [LLM_DE_STATUS.RUNNING]: "bg-[var(--brand-3)] text-[var(--brand-1)]", // 运行中 - 绿色
  [LLM_DE_STATUS.SLEEPING]: "bg-[var(--purple-6)] text-[var(--purple-1)]", // 休眠中 - 紫色
  [LLM_DE_STATUS.FAILED]: "bg-[var(--red-6)] text-[var(--red-1)]", // 已失败 - 红色
  [LLM_DE_STATUS.TERMINATED]: "bg-[var(--gray-3)] text-[var(--dark-2)]", // 已终止 - 灰色
  [LLM_DE_STATUS.PENDING]: "bg-[var(--gray-3)] text-[var(--dark-2)]", // 等待中 - 灰色 (过渡态)
  [LLM_DE_STATUS.DEPLOYING]: "bg-[var(--gray-3)] text-[var(--dark-2)]", // 初始化中 - 灰色 (过渡态)
  [LLM_DE_STATUS.ROLLING]: "bg-[var(--gray-3)] text-[var(--dark-2)]", // 滚动更新 - 灰色 (过渡态)
  [LLM_DE_STATUS.SCALING]: "bg-[var(--gray-3)] text-[var(--dark-2)]", // 扩缩容中 - 灰色 (过渡态)
  [LLM_DE_STATUS.TERMINATING]: "bg-[var(--gray-3)] text-[var(--dark-2)]", // 终止中 - 灰色 (过渡态)
};

export default function DEModelCard({
  data,
  onClick,
  onRedeploy,
  onDelete,
  onPause,
  onWake,
}: DEModelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    name,
    status,
    phase,
    resources,
    createUserName,
    createTime,
    baseModel,
    scalingPolicy,
  } = data;

  const formattedCreateTime = useMemo(() => {
    return formatRelativeTime(createTime);
  }, [createTime]);

  const modelName = useMemo(() => {
    if (baseModel?.modelId) return baseModel.modelId;
    if (baseModel?.modelAlias) return baseModel.modelAlias;
    return "Unknown Model";
  }, [baseModel]);

  const replicaRange = useMemo(() => {
    if (!scalingPolicy?.enable) return "1";
    return `${scalingPolicy.minReplicas}-${scalingPolicy.maxReplicas}`;
  }, [scalingPolicy]);

  // Status dot color mapping
  const statusDotClass = useMemo(() => {
    const isPulsing = PULSING_STATES.includes(status);
    const baseClass = styles.status_dot;

    switch (status) {
      case LLM_DE_STATUS.RUNNING:
        return `${baseClass} ${styles.status_dot_running}`;
      case LLM_DE_STATUS.SLEEPING:
        return `${baseClass} ${styles.status_dot_sleeping}`;
      case LLM_DE_STATUS.FAILED:
        return `${baseClass} ${styles.status_dot_failed}`;
      case LLM_DE_STATUS.TERMINATED:
        return `${baseClass} ${styles.status_dot_terminated}`;
      case LLM_DE_STATUS.PENDING:
      case LLM_DE_STATUS.DEPLOYING:
      case LLM_DE_STATUS.SCALING:
        return `${baseClass} ${styles.status_dot_transitioning} ${isPulsing ? styles.pulse : ""}`;
      case LLM_DE_STATUS.ROLLING:
        return `${baseClass} ${styles.status_dot_rolling} ${isPulsing ? styles.pulse : ""}`;
      case LLM_DE_STATUS.TERMINATING:
        return `${baseClass} ${styles.status_dot_terminating} ${isPulsing ? styles.pulse : ""}`;
      default:
        return baseClass;
    }
  }, [status]);

  // Model source display
  const modelSource = useMemo(() => {
    const provider = baseModel?.provider?.toLowerCase();
    if (provider === "novita") {
      return { icon: "/logo/novita-icon.svg", label: "Novita" };
    }
    return { icon: "/logo/huggingface.svg", label: "HuggingFace" };
  }, [baseModel?.provider]);

  // Status display text
  const statusText = useMemo(() => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }, [status]);

  // Action buttons based on status - PRD 6.1 状态-操作矩阵
  // Terminate: pending, deploying, running, sleeping, rolling, scaling
  // Wake Up: sleeping
  // Redeploy: terminated, failed
  // Delete: terminated, failed
  // terminating: 不可干预
  const actionButtons = useMemo(() => {
    const actions: Array<{
      key: string;
      label: string;
      onClick: (e: React.MouseEvent) => void;
      variant?: "destructive" | "outline";
    }> = [];

    switch (status) {
      case LLM_DE_STATUS.PENDING:
        // 取消创建 - Terminate
        if (onPause) {
          actions.push({
            key: "terminate",
            label: "Terminate",
            onClick: (e) => {
              e.stopPropagation();
              onPause(data);
            },
          });
        }
        break;

      case LLM_DE_STATUS.DEPLOYING:
        // 中止部署 - Terminate
        if (onPause) {
          actions.push({
            key: "terminate",
            label: "Terminate",
            onClick: (e) => {
              e.stopPropagation();
              onPause(data);
            },
          });
        }
        break;

      case LLM_DE_STATUS.RUNNING:
        // Terminate (Restart 仅在 Settings 修改推理引擎参数后出现)
        if (onPause) {
          actions.push({
            key: "terminate",
            label: "Terminate",
            onClick: (e) => {
              e.stopPropagation();
              onPause(data);
            },
          });
        }
        break;

      case LLM_DE_STATUS.SLEEPING:
        // Wake Up + Terminate (顺序与详情页一致)
        if (onWake) {
          actions.push({
            key: "wake",
            label: "Wake Up",
            onClick: (e) => {
              e.stopPropagation();
              onWake(data);
            },
          });
        }
        if (onPause) {
          actions.push({
            key: "terminate",
            label: "Terminate",
            onClick: (e) => {
              e.stopPropagation();
              onPause(data);
            },
          });
        }
        break;

      case LLM_DE_STATUS.TERMINATED:
      case LLM_DE_STATUS.FAILED:
        // Redeploy + Delete
        if (onRedeploy) {
          actions.push({
            key: "redeploy",
            label: "Redeploy",
            onClick: (e) => {
              e.stopPropagation();
              onRedeploy(data);
            },
          });
        }
        break;

      case LLM_DE_STATUS.ROLLING:
      case LLM_DE_STATUS.SCALING:
        // 滚动更新/扩缩容中 - 允许 Terminate
        if (onPause) {
          actions.push({
            key: "terminate",
            label: "Terminate",
            onClick: (e) => {
              e.stopPropagation();
              onPause(data);
            },
          });
        }
        break;

      // terminating: 不可干预
      default:
        break;
    }

    return actions;
  }, [status, data, onRedeploy, onPause, onWake]);

  // Check if delete is allowed - PRD 6.1: 仅 terminated, failed 可删除
  const canDelete = useMemo(() => {
    return (
      onDelete &&
      [LLM_DE_STATUS.TERMINATED, LLM_DE_STATUS.FAILED].includes(status)
    );
  }, [status, onDelete]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(data);
  };

  return (
    <div
      className={styles.de_model_card}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left section: Status dot + Content */}
      <div className={styles.left_section}>
        {/* Status dot */}
        <span className={statusDotClass}></span>

        {/* Content */}
        <div className={styles.content}>
          {/* Name */}
          <h3 className={styles.name}>{name}</h3>

          {/* Model name */}
          <p className={styles.model_name}>{modelName}</p>

          {/* Meta tags */}
          <div className={styles.meta_tags}>
            {/* GPU */}
            <span className={styles.meta_tag}>
              <Cpu className="w-3 h-3" />
              {`${resources.gpu.name} ×${resources.gpu.count}`}
            </span>

            {/* Replicas range */}
            <span className={styles.meta_tag}>
              <Layers className="w-3 h-3" />
              {`${replicaRange} replicas`}
            </span>

            {/* Model source - color only, no icon */}
            <span
              className={cn(
                styles.meta_tag,
                modelSource.label === "Novita"
                  ? "bg-[var(--brand-3)] text-[var(--brand-1)]"
                  : "bg-[var(--yellow-6)] text-[var(--yellow-1)]",
              )}
            >
              {modelSource.label}
            </span>

            {/* Creator */}
            <span className={styles.meta_tag}>
              <User className="w-3 h-3" />
              {createUserName}
            </span>

            {/* Create time */}
            <span className={styles.meta_tag}>
              <Clock className="w-3 h-3" />
              {formattedCreateTime}
            </span>
          </div>
        </div>
      </div>

      {/* Right section: Status tag at top, Actions at bottom */}
      <div className={styles.right_section}>
        {/* Status tag - top right */}
        <span
          className={cn(
            "px-2.5 py-0.5 rounded text-[12px] font-medium",
            STATUS_TAG_STYLES[status] ||
              "bg-[var(--gray-3)] text-[var(--dark-2)]",
          )}
        >
          {statusText}
        </span>

        {/* Action buttons - bottom right, show on hover */}
        <div
          className={cn(
            "flex items-center gap-2 transition-all duration-150",
            isHovered && (actionButtons.length > 0 || canDelete)
              ? "opacity-100 visible"
              : "opacity-0 invisible",
          )}
        >
          {actionButtons.map((action) => (
            <Button
              key={action.key}
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[12px]"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[12px] text-[var(--red-1)] border-[var(--red-4)] hover:bg-[var(--red-6)] hover:text-[var(--red-1)] hover:border-[var(--red-3)]"
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
