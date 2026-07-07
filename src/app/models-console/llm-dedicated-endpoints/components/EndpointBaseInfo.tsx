import { Copy } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { message } from "@/components/ui/standard/notify";
import { cn } from "@/lib/utils";
import styles from "../sub-pages/DedicatedEndpointDetail.module.scss";

interface EndpointBaseInfoProps {
  healthy: string;
  endpointUrl: string;
  endpointId: string;
  modelName: string;
  replica: number;
  readyReplica: number;
}

export default function EndpointBaseInfo({
  healthy,
  endpointUrl,
  endpointId,
  modelName,
  replica,
  readyReplica,
}: EndpointBaseInfoProps) {
  return (
    <div className={styles.card_wrapper}>
      <p className={styles.separator_title}>Endpoint</p>
      <div className={styles.grid_info}>
        <div>
          <p className={styles.info_title}>Endpoint Health</p>
          <p className={styles.info_value}>
            <span
              className={cn(`${styles.healthy_tag}`, {
                [styles.healthy_tag_healthy]: healthy === "healthy",
              })}
            >
              {healthy.charAt(0).toUpperCase() + healthy.slice(1)}
            </span>
          </p>
        </div>

        <div>
          <p className={styles.info_title}>Replicas</p>
          <p
            className={styles.info_value}
          >{`${readyReplica} running out of ${replica}`}</p>
        </div>

        <div>
          <p className={styles.info_title}>OpenAI Compatible Base URL</p>
          <CopyToClipboard
            text={endpointUrl}
            onCopy={() => {
              message.success("Copied to clipboard!");
            }}
          >
            <div className="flex items-center gap-2">
              <p className={`${styles.info_value} ${styles.copy_text}`}>
                {endpointUrl}
              </p>
              <Copy className="h-4 w-4" />
            </div>
          </CopyToClipboard>
        </div>

        <div>
          <p className={styles.info_title}>Endpoint ID</p>
          <CopyToClipboard
            text={endpointId}
            onCopy={() => {
              message.success("Copied to clipboard!");
            }}
          >
            <div className="flex items-center gap-2">
              <p className={`${styles.info_value} ${styles.copy_text}`}>
                {endpointId}
              </p>
              <Copy className="h-4 w-4" />
            </div>
          </CopyToClipboard>
        </div>

        <div>
          <p className={styles.info_title}>Model ID</p>
          <CopyToClipboard
            text={modelName}
            onCopy={() => {
              message.success("Copied to clipboard!");
            }}
          >
            <div className="flex items-center gap-2">
              <p className={`${styles.info_value} ${styles.copy_text}`}>
                {modelName}
              </p>
              <Copy className="h-4 w-4" />
            </div>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
}
