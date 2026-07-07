import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import styles from "./AudioPlayer.module.css";

type IProps = {
  src: string;
};

export default function AudioPlayer({ src }: IProps) {
  const waveRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const ws = WaveSurfer.create({
      container: waveRef.current as HTMLDivElement,
      height: 100,
      waveColor: "#4F4A85",
      progressColor: "#fff",
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      media: audioRef.current as HTMLMediaElement,
    });
    return () => {
      ws.destroy();
    };
  }, []);

  return (
    <div className={styles.audioBox}>
      <p>Audio</p>
      <div ref={waveRef} className={styles.wave}></div>
      <audio
        className={styles.audio}
        ref={audioRef}
        src={src}
        controls
        controlsList="noplaybackrate nodownload"
      />
    </div>
  );
}
