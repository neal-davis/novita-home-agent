import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import styles from "./jobState.module.scss";
import { CircleHelp as QuestionCircleOutlined } from "lucide-react";

export default function JobState({
  state,
  reason,
}: {
  state: string;
  reason?: Array<string>;
}) {
  function getColor(state: string) {
    switch (state) {
      case "Succeeded":
        return "var(--brand-2)";
      case "Failed":
        return "var(--red-5)";
      case "Running":
        return "var(--brand-2)";
      case "Pending":
        return "var(--gray-3)";
      default:
        return "var(--gray-3)";
    }
  }
  function getText(state: string) {
    switch (state) {
      case "Succeeded":
        return "SUCCEEDED";
      case "Failed":
        return "FAILED";
      case "Running":
        return "RUNNING";
      case "Pending":
        return "PENDING";
      default:
        return "UNKNOWN";
    }
  }
  return (
    <span className="inline-flex items-center justify-end gap-1 align-middle">
      {state === "Failed" && reason && reason.length > 0 ? (
        <Tooltip
          title={
            <div>
              {reason?.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          }
        >
          <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[var(--red-1)]">
            <QuestionCircleOutlined size={14} />
          </span>
        </Tooltip>
      ) : (
        ""
      )}
      <span
        className={`${styles.container} ${styles.state} font-small-console`}
        style={{ backgroundColor: getColor(state) }}
      >
        {getText(state)}
      </span>
    </span>
  );
}
