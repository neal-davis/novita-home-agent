import { useRef } from "react";
import styles from "./MotionSync.module.scss";

export default function MotionVideo({
  src,
  poster,
  onSelect,
  selected,
  loading,
}: {
  src: string;
  poster?: string;
  loading?: boolean;
  onSelect: () => void;
  selected: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div
      className={`
        ${styles.motion_video_wrap}
        ${selected ? styles.active : ""}
        ${loading ? styles.disabled : ""}
      `}
      onClick={() => {
        if (loading) {
          return;
        }
        onSelect();
      }}
    >
      <video
        ref={ref}
        className={styles.motion_video}
        loop
        muted
        playsInline
        controls={false}
        onMouseEnter={(e) => {
          (e.target as HTMLVideoElement).play();
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLVideoElement).pause();
          (e.target as HTMLVideoElement).currentTime = 0;
        }}
        poster={poster}
        src={src}
      ></video>
    </div>
  );
}
