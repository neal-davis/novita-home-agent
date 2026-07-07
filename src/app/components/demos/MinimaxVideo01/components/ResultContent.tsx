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
}
export default function ResultContent({
  resultVideoUrl,
  generating,
  queueing,
  rootPage,
  taskProgress,
  cancelTask,
  copy,
}: ResultContentProps) {
  return (
    <div
      className={`${styles.video_wrapper} ${rootPage === "product" ? styles.video_wrapper_in_product : ""}`}
    >
      {resultVideoUrl && (
        <video controls className={styles.video} src={resultVideoUrl} />
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
      {!resultVideoUrl && !generating && <ImagePlaceholder noborder large />}
    </div>
  );
}
