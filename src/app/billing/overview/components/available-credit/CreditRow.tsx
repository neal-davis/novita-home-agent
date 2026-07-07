import { CircleHelp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import styles from "./index.module.scss";

interface CreditRowProps {
  label: string;
  value: string;
  tooltip?: string;
  isWarning?: boolean;
}

const CreditRow = ({
  label,
  value,
  tooltip,
  isWarning = false,
}: CreditRowProps) => {
  const numValue = Number(value);
  const displayValue = isWarning && numValue === 0 ? "-" : `$${value}`;
  const shouldShowWarning = isWarning && numValue !== 0;

  return (
    <div className={`${styles.row} ${shouldShowWarning ? styles.warning : ""}`}>
      <div className={styles.label}>
        <span>{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <CircleHelp className={styles.info_icon} />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                sideOffset={8}
                className="max-w-[320px] break-words"
                collisionPadding={16}
              >
                <p className="leading-relaxed">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={styles.value}>{displayValue}</div>
    </div>
  );
};

export default CreditRow;
