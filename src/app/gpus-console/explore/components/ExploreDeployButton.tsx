"use client";

import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { Button } from "@/components/ui/button";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import styles from "./section.module.scss";

export default function ExploreDeployButton({
  step,
  usableNode,
  onDeploy,
}: {
  step: number;
  usableNode: boolean;
  onDeploy: () => void;
}) {
  if (usableNode) {
    return (
      <Button
        className="w-full h-[44px]"
        variant="default"
        onClick={onDeploy}
        id={
          step === 2
            ? CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_DEPLOY_CONFIRM
            : CLICK_BTN_IDs.GPUS_CONSOLE.EXPLORE_NEXT
        }
      >
        {"Deploy"}
      </Button>
    );
  }

  return (
    <Tooltip
      placement="top"
      zIndex={10000}
      title="Please select a product with stock."
    >
      <div
        className="w-full h-[44px] rounded-sm
      bg-[var(--brand-0)] opacity-50 cursor-not-allowed flex items-center justify-center"
      >
        <span className={styles.nextBtnTxt} style={{ color: "var(--black)" }}>
          {"Deploy"}
        </span>
      </div>
    </Tooltip>
  );
}
