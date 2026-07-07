import { useMemo } from "react";
import { truncateLongStrings } from "../../utils/result";
import { MultimodalTaskResult } from "@/types/multimodal-playground";
import { CopyButton } from "../CopyButton";
import styles from "./states.module.scss";
interface JSONContentProps {
  result: MultimodalTaskResult | null;
}
export const JSONContent = ({ result }: JSONContentProps) => {
  const isBlob = result instanceof Blob;
  const truncatedResult = useMemo(() => {
    return truncateLongStrings(result);
  }, [result]);
  if (isBlob) {
    return (
      <div className={styles.json_container}>
        <pre className={styles.json_content}>{"Blob result"}</pre>
      </div>
    );
  }
  return (
    <div className={styles.json_container}>
      <div className={styles.json_header}>
        <CopyButton content={JSON.stringify(result, null, 2)} />
      </div>
      <pre className={styles.json_content}>
        {JSON.stringify(truncatedResult, null, 2)}
      </pre>
    </div>
  );
};
