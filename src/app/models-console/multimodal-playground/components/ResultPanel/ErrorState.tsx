import Image from "next/image";
import styles from "./states.module.scss";
interface ErrorStateProps {
  error?: string | null;
  traceId?: string;
}
export const ErrorState = ({ error, traceId }: ErrorStateProps) => {
  return (
    <div className={styles.error_state}>
      <div className={styles.empty_icon}>
        <Image
          src="/logo/logo_small_gray.svg"
          alt="Empty state"
          width={174}
          height={174}
        />
      </div>
      <p className={styles.tip_text}>{"Generation failed"}</p>
      <p className={styles.reason_text}>{error}</p>
      {traceId && (
        <p className={styles.trace_id}>
          {"Trace ID: {traceId}".replace("{traceId}", traceId)}
        </p>
      )}
    </div>
  );
};
