import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import { X as CloseOutlined } from "lucide-react";
import styles from "../index.module.scss";
import Loading from "@/app/components/Loading/Loading";
import ImagePlaceholder from "../../ImagePlaceholder/ImagePlaceholder";
interface ResultContentProps {
  resultVideoUrl: string;
  generating: boolean;
  queueing: boolean;
  rootPage: string;
  taskProgress: number;
  cancelTask: () => void;
  copy: any;
  isNsfw: boolean;
}
export default function ResultContent({
  resultVideoUrl,
  generating,
  queueing,
  rootPage,
  taskProgress,
  cancelTask,
  copy,
  isNsfw,
}: ResultContentProps) {
  return (
    <div
      className={`${styles.video_wrapper} ${rootPage === "product" ? styles.video_wrapper_in_product : ""}`}
    >
      {resultVideoUrl && !isNsfw && (
        <video controls className={styles.video} src={resultVideoUrl} />
      )}
      {resultVideoUrl && isNsfw && (
        <div className={styles.nsfw_blocked_content}>
          <div className={styles.nsfw_blocked_info}>
            <h3 className={styles.nsfw_blocked_title}>
              Blocked by NSFW Filter
            </h3>
            <p className={styles.nsfw_blocked_message}>
              This video was flagged and blocked. Charges may apply due to GPU
              usage.
            </p>
          </div>
        </div>
      )}
      {(generating || queueing) && (
        <div className={styles.result_video_placeholder}>
          <Loading
            text={
              queueing ? "Queueing..." : `${"Processing..."} ${taskProgress}%`
            }
            desc={
              "This task may take some time (a few minutes), please be patient."
            }
            extra={
              <Button
                shape="circle"
                className={styles.cancel_btn}
                onClick={cancelTask}
                icon={<CloseOutlined />}
              ></Button>
            }
          />
        </div>
      )}
      {!resultVideoUrl && !generating && (
        <div className={styles.placeholder_container}>
          <ImagePlaceholder
            noborder
            large
            tipsTitle="NSFW Filter Enabled"
            tipsMessage="Videos with unsafe content will be blocked. GPU usage may still incur charges even if output is blacked out."
          />
        </div>
      )}
    </div>
  );
}
