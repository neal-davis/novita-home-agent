import { useMemo } from "react";
import { CircleStop } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./DEModelStatus.module.scss";
import Tooltip from "@/app/components/Tooltip";
import { Info } from "lucide-react";

export const LLM_DE_STATUS = {
  PENDING: "pending", // 等待中 - 端点已创建，等待资源分配 (过渡态)
  DEPLOYING: "deploying", // 初始化中 - 首次部署或重新部署，拉取模型+启动引擎 (过渡态)
  ROLLING: "rolling", // 滚动更新 - 滚动重启中，新实例起来后旧实例才终止 (过渡态)
  SCALING: "scaling", // 扩缩容中 - 自动扩缩容正在执行 (过渡态)
  RUNNING: "running", // 运行中 - 端点健康运行，可正常服务请求
  SLEEPING: "sleeping", // 休眠中 - Scale-to-Zero 后的休眠态，首次请求自动唤醒
  TERMINATING: "terminating", // 终止中 - 正在关闭端点，排空流量 (过渡态)
  TERMINATED: "terminated", // 已终止 - 端点已终止，可重新部署或删除
  FAILED: "failed", // 已失败 - 部署或运行失败，需排查或重新部署
};

const PHASE_DISPLAY = {
  requesting_gpu: "Requesting GPU",
  downloading_model: "Downloading Model",
  engine_initializing: "Engine Initializing",
};

export default function DEModelStatus({
  className,
  status,
  phase,
}: {
  className?: string;
  status: string;
  phase?: string;
}) {
  const statusTag = useMemo(() => {
    if (status === LLM_DE_STATUS.DEPLOYING && phase) {
      const tag = PHASE_DISPLAY[phase as keyof typeof PHASE_DISPLAY];
      if (tag) {
        return tag;
      }
    }
    return status;
  }, [status, phase]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className={cn(`flex items-center gap-1 ${styles.status_tag}`, {
          [styles.status_tag_running]: status === LLM_DE_STATUS.RUNNING,
          [styles.status_tag_sleeping]: status === LLM_DE_STATUS.SLEEPING,
          [styles.status_tag_failed]: status === LLM_DE_STATUS.FAILED,
          [styles.status_tag_terminated]: status === LLM_DE_STATUS.TERMINATED,
          [styles.status_tag_pending]: status === LLM_DE_STATUS.PENDING,
          [styles.status_tag_deploying]: status === LLM_DE_STATUS.DEPLOYING,
          [styles.status_tag_rolling]: status === LLM_DE_STATUS.ROLLING,
          [styles.status_tag_scaling]: status === LLM_DE_STATUS.SCALING,
          [styles.status_tag_terminating]: status === LLM_DE_STATUS.TERMINATING,
        })}
      >
        {status === LLM_DE_STATUS.TERMINATED && (
          <CircleStop className="w-3 h-3" />
        )}
        <span>{statusTag.toUpperCase()}</span>
      </div>
      {status === LLM_DE_STATUS.ROLLING && (
        <Tooltip
          content="Performing a version update"
          placement="right"
          contentClassName="w-[200px] whitespace-normal"
        >
          <Info className="w-3 h-3" color="var(--dark-2)" />
        </Tooltip>
      )}
    </div>
  );
}
