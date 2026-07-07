"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store";
import utils, {
  Iposition,
  CONTAINER_HEIGHT,
  CONTAINER_WIDTH,
} from "./componentUtils";
import { NOVITA_URL } from "@/constants/urls";
import { Button } from "@/components/ui/button";
import styles from "./index.module.scss";

export default function EnterprisePlanTips() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Iposition>({ x: 0, y: 0 });
  const enterprise = useAppSelector((state) => state.config.enterprise);

  useEffect(() => {
    utils.addTipsSubscription((position: Iposition) => {
      setPosition(position);
      setVisible(true);
    });
    return () => {
      utils.deleteSubscription();
    };
  }, []);

  useEffect(() => {
    utils.updateEnterpriseInfo(enterprise);
  }, [enterprise]);

  const handleLater = useCallback(() => {
    utils.setRemindLater();
    setVisible(false);
  }, []);

  const handleGoToSetting = useCallback(() => {
    utils.setRemindLater();
    window.open(NOVITA_URL.MODEL_API_CONSOLE_SETTINGS, "_blank");
    setVisible(false);
  }, []);

  if (!visible) {
    return <></>;
  }

  const styleObj = {
    top: position.y,
    left: position.x,
    height: CONTAINER_HEIGHT,
    width: CONTAINER_WIDTH,
  };
  return (
    <div className={styles.tipsModal} style={styleObj}>
      <p className={styles.title}>
        {"You've subscribed to the Dedicated Endpoints."}
      </p>
      <p className={styles.message}>
        Would you like to generate it using your Dedicated Endpoints resources?
      </p>
      <div className={`${styles.btnWrapper} flex justify-between`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLater}
        >
          Maybe Later
        </Button>
        <Button
          size="sm"
          onClick={handleGoToSetting}
        >
          Go to Setting
        </Button>
      </div>
    </div>
  );
}
