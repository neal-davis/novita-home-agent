import { CardInterface } from "@/app/billing/lib/hooks/paymentMethods";
import styles from "./index.module.scss";
import { CSSProperties } from "react";

interface CardItemProps extends CardInterface {
  className?: string;
  style?: CSSProperties;
}

export function CardItem({
  brand,
  last4,
  expMonth,
  expYear,
  className,
  style,
}: CardItemProps) {
  return (
    <div className={`${styles.card_details} ${className || ""}`} style={style}>
      <div className={styles.card_info}>
        <div className={styles.icon}>
          <img src={`/billing/billing-visa.png`} alt={brand} />
        </div>
        <div className={styles.card_number}>
          {brand}****{last4}
        </div>
      </div>
      <div className={styles.card_expire}>
        Expiration: {expMonth}/{expYear}
      </div>
    </div>
  );
}
