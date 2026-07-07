"use client";

import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import styles from "./OnDemandModelList.module.scss";

interface ModelCardProps {
  logo?: string;
  modelName: string;
  displayModelName?: string;
  onClick?: () => void;
}

export default function OnDemandModelCard({
  modelName,
  displayModelName,
  logo,
  onClick,
}: ModelCardProps) {
  return (
    <div onClick={onClick} className={styles.model_card}>
      <ModelLogo logo={logo} modelName={modelName} size={24} />
      <div className={styles.modelName}>{displayModelName || modelName}</div>
      <div className={styles.label}>
        <span>Serverless</span>
        <span>Dedicated</span>
      </div>
    </div>
  );
}
