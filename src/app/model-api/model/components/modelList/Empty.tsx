import styles from "./modelList.module.css";

export function Empty() {
  return (
    <div className={styles.empty}>
      <p>No models found!</p>
    </div>
  );
}
