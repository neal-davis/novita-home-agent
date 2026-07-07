import styles from "./VideoCase.module.scss";

type VideoCaseProps = {
  oriVideoUrl: string;
  resultVideoUrl: string;
  autoPlay?: boolean;
  loop?: boolean;
};

export default function VideoBaseCase({
  oriVideoUrl,
  resultVideoUrl,
  autoPlay,
  loop,
}: VideoCaseProps) {
  return (
    <div className={styles.case_wrapper}>
      <div className={styles.video_wrapper}>
        <video
          controls
          className={styles.video_el}
          src={oriVideoUrl}
          autoPlay={autoPlay}
          muted={autoPlay}
          loop={loop}
        ></video>
      </div>
      <div className={styles.video_pipe}></div>
      <div className={styles.video_wrapper}>
        <video
          controls
          className={styles.video_el}
          src={resultVideoUrl}
          autoPlay={autoPlay}
          muted={autoPlay}
          loop={loop}
        ></video>
      </div>
    </div>
  );
}
