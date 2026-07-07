import { useEffect, useRef, useCallback, useState, CSSProperties } from "react";
import { Play } from "lucide-react"
import styles from "./VoiceBox.module.css";

type IProps = {
  src: string;
  title: string;
  tags?: string[];
  description?: string;
  width?: number;
  style?: CSSProperties;
  initVolume?: number;
};

function musicWave() {
  return (
    <div className={styles.musicWave}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

export default function VoiceBox(props: IProps) {
  const {
    src,
    title = "",
    tags,
    description = "",
    style = {},
    initVolume,
  } = props;

  const [paused, setPaused] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (initVolume) {
      const target = audioRef.current as HTMLAudioElement;
      target.volume = initVolume;
    }
  }, [initVolume]);

  const handlePlaySwitch = useCallback(() => {
    const target = audioRef.current as HTMLAudioElement;
    if (target.paused) {
      target.play();
      setPaused(false);
    } else {
      target.pause();
      setPaused(true);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setPaused(true);
  }, []);

  return (
    <div className={styles.voiceBox} style={style} onClick={handlePlaySwitch}>
      <div className={styles.audioButton}>
        <div>
          <div>
            {paused ? (
              <Play className="w-4 h-4" />
            ) : (
              musicWave()
            )}
          </div>
        </div>
      </div>
      <main>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          {tags &&
            tags.map((tag, index) => (
              <span
                className={`${styles.tag} ${styles[`tag${index + 1}`]}`}
                key={index}
              >
                {tag}
              </span>
            ))}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </main>
      <audio ref={audioRef} src={src} onEnded={handleAudioEnded}></audio>
    </div>
  );
}
