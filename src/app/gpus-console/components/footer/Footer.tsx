"use client";

import styles from "./Footer.module.scss";
import { useRef, useEffect, useState } from "react";
import { MyButton } from "../mainPage";
import { useRouter } from "next/navigation";
import { createNetworkInfo } from "../mainPage/cfg";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.copyFooter}>© 2024 CopyAI, Inc</div>
      <div className={styles.rightFooter}>
        <div className={styles.name}>Careers</div>
        <div className={styles.name}>Privacy Notice</div>
        <div className={styles.name}>Terms of Service</div>
        <div className={styles.name}>Status</div>
      </div>
      <img style={{ marginLeft: "64px" }} src="/home/logo.svg" alt="logo" />
    </footer>
  );
}

const BigTextFooter = () => {
  const titleRef = useRef<any>();
  const router = useRouter();
  const [addAnimationCss, setAddAnimationCss] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === titleRef.current) {
            setAddAnimationCss(true);
          }

          observer.unobserve(entry.target);
        }
      });
    });

    const ele = titleRef.current;
    observer.observe(ele);
  }, []);

  return (
    <div className={styles.cardWrap} style={{ background: "#2f2f2f" }}>
      <div className={styles.footerCard}>
        <div
          ref={titleRef}
          className={`${styles.cardTitle} ${
            addAnimationCss ? styles.animationFadein : ""
          }`}
        >
          Experience the most cost-effective GPU cloud platform built for
          production.
        </div>
        <MyButton
          variant="outline"
          className={`${styles.btn} ${styles.greenBtn}`}
          onClick={() => router.push("/login")}
        >
          <span>Get a Start </span>
          {/* <img className={styles.arrowImg} src="/home/arrow-right.svg" /> */}
        </MyButton>
      </div>
    </div>
  );
};

export const DocFooter = () => {
  const networkInfo = createNetworkInfo();

  return (
    <div className={styles.cardWrap} style={{ background: "#000" }}>
      <div className={styles.docCard}>
        {networkInfo.map((item) => (
          <div className={styles.cardContent} key={item.name}>
            <div className={styles.cardTitle}>{item.name}</div>
            <div className={styles.cardBorder} />
            <div className={styles.subContentWrap}>
              {item.values.map((it) => (
                <div className={styles.subContent} key={it.text}>
                  {it.url ? (
                    <a
                      href={it.url}
                      style={{ wordWrap: "break-word" }}
                      target="_blank"
                    >
                      {it.text}
                    </a>
                  ) : (
                    it.text
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
