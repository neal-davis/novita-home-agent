import { useEffect, useRef, useState } from "react";
import styles from "./VideoCase.module.scss";

type VideoCaseProps = {
  oriVideoUrl: string;
  resultVideoUrls: string[];
};

export default function MagicCut({
  oriVideoUrl,
  resultVideoUrls,
}: VideoCaseProps) {
  const [curClip, setCurClip] = useState(resultVideoUrls[0]);

  const resultVideoEl = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (!resultVideoEl.current) {
        return;
      }
      const rect = resultVideoEl.current.getBoundingClientRect();
      resultVideoEl.current.style.width = `${rect.width}px`;
      resultVideoEl.current.style.height = `${rect.height}px`;
    }, 400);
  }, []);

  return (
    <div className={styles.case_wrapper}>
      <div className={styles.video_wrapper}>
        <video
          controls
          className={styles.video_el}
          src={oriVideoUrl}
          autoPlay
          muted
        ></video>
      </div>
      <div className={styles.video_pipe}></div>
      <div className={styles.video_wrapper}>
        <video
          ref={resultVideoEl}
          controls
          className={styles.video_el}
          src={curClip}
          onLoadedMetadata={() => {
            setTimeout(() => {
              if (!resultVideoEl.current) {
                return;
              }
              const rect = resultVideoEl.current.getBoundingClientRect();
              resultVideoEl.current.style.width = `${rect.width}px`;
              resultVideoEl.current.style.height = `${rect.height}px`;
            }, 200);
          }}
          autoPlay
          muted
        ></video>
        <div className={styles.clips_wrapper}>
          {resultVideoUrls.map((url: string) => {
            return (
              <div
                key={url}
                className={`${styles.clip_cover} ${
                  curClip === url ? styles.clip_cover_active : ""
                }`}
                onClick={() => setCurClip(url)}
              >
                <img src={url.replace(".mp4", ".jpg")} alt="" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
