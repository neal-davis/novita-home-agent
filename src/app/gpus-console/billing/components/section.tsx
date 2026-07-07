import styles from "./section.module.scss";
import BillingTable from "./billingTable";

export default function Section() {
  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <div>
          <BillingTable />
        </div>
      </div>
    </div>
  );
}
