import { MultimodalTaskResult } from "@/types/multimodal-playground";
import { getResultType, ResultCategory } from "../../utils/result";
import styles from "./ResultPanel.module.scss";
interface StatusBadgeProps {
  status: "idle" | "creating" | "polling" | "success" | "error";
  result: MultimodalTaskResult | null;
  category: ResultCategory;
}
export const StatusBadge = ({ status, result, category }: StatusBadgeProps) => {
  const resultType = getResultType(result, category);
  const statusConfig: Record<
    typeof status,
    {
      label: string;
      variant: "init" | "creating" | "polling" | "success" | "error";
      icon?: React.ReactNode;
    }
  > = {
    idle: {
      label: resultType ? "Example result" : "Pending",
      variant: resultType ? "success" : "init",
    },
    creating: {
      label: "Submitting task...",
      variant: "creating",
    },
    polling: {
      label: "Generating...",
      variant: "polling",
    },
    success: {
      label: "Success",
      variant: "success",
    },
    error: {
      label: "Failed",
      variant: "error",
    },
  };
  const config = statusConfig[status];
  return (
    <div
      className={`${styles.status_badge} ${styles[`badge_${config.variant}`]} font-small`}
    >
      {config.label}
    </div>
  );
};
