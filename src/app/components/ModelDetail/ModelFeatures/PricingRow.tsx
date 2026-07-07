import React from "react";
import styles from "./index.module.scss";

interface PricingRowProps {
  label: string;
  value: string;
  originValue?: string | null;
}

const PricingRow: React.FC<PricingRowProps> = ({
  label,
  value,
  originValue = null,
}) => {
  return (
    <div className={styles.pricingRow}>
      <span className={styles.pricingLabel}>{label}</span>
      <span className={styles.pricingValue}>
        {value}
        {originValue && (
          <span className={styles.pricingOriginValue}>{originValue}</span>
        )}
      </span>
    </div>
  );
};

export default PricingRow;
