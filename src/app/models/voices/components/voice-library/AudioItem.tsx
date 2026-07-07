"use client";

import { useCallback, useRef, useState } from "react";
import styles from "./VoiceLibrary.module.scss";

export default function AudioItem({
  title,
  desc,
  audioUrl,
  voiceId,
}: {
  title: string;
  desc: string;
  audioUrl: string;
  voiceId: string;
}) {
  const [paused, setPaused] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    <div className={`${styles.item} text-start`} onClick={handlePlaySwitch}>
      <div className={`${styles.play_btn} flex items-center justify-center`}>
        {paused ? (
          <span className="iconfont icon-play" style={{ fontSize: 12 }}></span>
        ) : (
          <span className="iconfont icon-pause" style={{ fontSize: 12 }}></span>
        )}
      </div>
      <div className={styles.content}>
        <div className="font-h6 mb-[6px]">{title}</div>
        <div className="font-subtle">
          {desc} <br />{" "}
          <span className="font-subtle-medium">Voice ID: {voiceId}</span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnded}
        className={styles.audio_hidden}
      ></audio>
    </div>
  );
}
