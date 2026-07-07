"use client";

import { useEffect, useState, useRef } from "react";
import { LottieRefCurrentProps } from "lottie-react";
import { useMedia } from "react-use";
import styles from "./index.module.scss";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function ReadyStartAnimation() {
  const refTmp = useRef<any>(null);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const isMobile = useMedia("(max-width: 640px)");
  const isPc = useMedia("(min-width: 1340px)");
  const [animationData, setAnimationData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAnimation = async () => {
      fetch("/homepage/06_START_TODAY_390.json")
        .then((res) => res.json())
        .then((data) => {
          setAnimationData(data);
        });
    };
    loadAnimation();
  }, [isMobile, isPc]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (refTmp.current === entry.target && isLoaded) {
          if (entry.intersectionRatio > 0) {
            lottieRef?.current?.play();
          } else {
            lottieRef?.current?.pause();
          }
        }
      });
    });
    const ele = refTmp.current;
    observer.observe(ele);
  }, [isLoaded]);

  const LottieAnimation = () => {
    return (
      <Lottie
        style={{ width: "100%", height: "100%" }}
        lottieRef={lottieRef}
        animationData={animationData}
        onDOMLoaded={() => {
          setIsLoaded(true);
        }}
        loop={true}
      />
    );
  };

  return (
    <div ref={refTmp}>
      <div className={styles.mobile_wrapper}>
        <LottieAnimation />
      </div>
      <div className={styles.pc_wrapper}>
        <LottieAnimation />
      </div>
    </div>
  );
}
