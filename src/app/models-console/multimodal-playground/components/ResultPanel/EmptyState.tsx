import Image from "next/image";
import styles from "./states.module.scss";
export const EmptyState = () => {
  return (
    <div className={styles.empty_state}>
      <div className={styles.empty_icon}>
        <Image
          src="/logo/logo_small_gray.svg"
          alt="Empty state"
          width={174}
          height={174}
        />
      </div>
      <p className={styles.empty_text}>
        {"Set parameters and click Generate to get results"}
      </p>
    </div>
  );
};
