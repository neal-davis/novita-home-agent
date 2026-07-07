"use client";

import styles from "./index.module.scss";
import { getWhyUsList } from "./data";
import { useState, useEffect } from "react";
import { useI18nSubscription } from "@/i18n/provider";

const whyUsStyles = [
  {
    leftSpiterBg: "#2563EB",
    leftbg:
      "linear-gradient(90deg, #EFF3FC 0%, rgba(239, 243, 252, 0.00) 100%)",
    rightbg:
      "linear-gradient(90deg, rgba(239, 243, 252, 0.00) 0%, #EFF3FC 100%), #FFF",
    rightboxShadow: "0 1px 20px 0 rgba(0, 0, 0, 0.10)",
  },
  {
    leftSpiterBg: "#9C25EB",
    leftbg:
      "linear-gradient(90deg, #FAF4FF 0%, rgba(250, 244, 255, 0.00) 100%)",
    rightbg:
      "linear-gradient(90deg, rgba(250, 244, 255, 0.00) 0%, #FAF4FF 100%), #FFF",
  },
  {
    leftSpiterBg: "#0BC779",
    leftbg:
      "linear-gradient(90deg, #E8FFEE 0%, rgba(232, 255, 238, 0.00) 100%)",
    rightbg:
      "linear-gradient(90deg, rgba(232, 255, 238, 0.00) 0%, #E8FFEE 100%), #FFF",
  },
  {
    leftSpiterBg: "#E85014",
    leftbg:
      "linear-gradient(90deg, #FFF2ED 0%, rgba(255, 242, 237, 0.00) 100%)",
    rightbg:
      "linear-gradient(90deg, rgba(255, 242, 237, 0.00) 0%, #FFF2ED 100%), #FFF",
  },
];

const AUTO_PLAY_INTERVAL_MS = 3000;
const MAX_INDEX = 3;

type DescriptionPhase = "idle" | "exiting" | "entering";

export default function WhyUs({ baseModeList }: { baseModeList: any[] }) {
  useI18nSubscription();
  const whyUsList = getWhyUsList();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [phase, setPhase] = useState<DescriptionPhase>("idle");
  const [nextIndex, setNextIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= MAX_INDEX ? 0 : prev + 1));
    }, AUTO_PLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentIndex === displayedIndex && phase === "idle") return;
    if (phase === "idle") {
      setNextIndex(currentIndex);
      setPhase("exiting");
    } else {
      setNextIndex(currentIndex);
    }
  }, [currentIndex, displayedIndex, phase]);

  const handleDescriptionAnimationEnd = () => {
    if (phase === "exiting") {
      setDisplayedIndex(nextIndex);
      setPhase("entering");
    } else if (phase === "entering") {
      setPhase("idle");
    }
  };

  return (
    <div className="max_width_container py-[80px]">
      <div className="mx-web">
        <h3 className="font-h3 text-[var(--black)] mt-4">{"WHY US ?"}</h3>
        <h3 className={`${styles.title2} mb-[64px]`}>
          {"Unmatched AI Power, Unbeatable Value"}
        </h3>
        <div
          className={`${styles.faqWebContainer} items-center flex flex-row gap-8 w-full`}
        >
          <div className="w-[calc(50%-16px)] flex-1 flex-col items-center">
            {whyUsList.map((item: any, index) => (
              <div
                key={index}
                style={{
                  background:
                    currentIndex === index
                      ? whyUsStyles[index].leftbg
                      : "transparent",
                  borderLeft:
                    currentIndex === index
                      ? `4px solid ${whyUsStyles[index].leftSpiterBg}`
                      : "4px solid transparent",
                }}
              >
                <div
                  className="flex flex-col gap-[10px] py-4 pl-8 cursor-pointer"
                  style={{
                    color:
                      currentIndex === index
                        ? whyUsStyles[index].leftbg
                        : "var(--dark-3-1)",
                    background:
                      currentIndex === index
                        ? whyUsStyles[index].leftbg
                        : "transparent",
                  }}
                  onClick={() => setCurrentIndex(index)}
                >
                  <div className="font-h5 text-[var(--black)]">
                    {currentIndex === index
                      ? item.selectTitle
                      : item.unSelectTitle}
                  </div>
                  {currentIndex === index
                    ? index === 0
                      ? item.subTitle(baseModeList.length)
                      : item.subTitle
                    : ""}
                </div>
              </div>
            ))}
          </div>
          {whyUsList[displayedIndex].description && (
            <div
              className={`${styles.descriptionContainer} flex-1 w-[calc(50%-16px)] min-h-[280px] ${phase === "exiting" ? styles.scaleOut : phase === "entering" ? styles.scaleIn : ""}`}
              style={{
                background: whyUsStyles[displayedIndex]?.rightbg || "",
              }}
              onAnimationEnd={handleDescriptionAnimationEnd}
            >
              {whyUsList[displayedIndex].description.map(
                (description: any, index: number) => (
                  <div key={index} className="flex flex-row gap-4">
                    {typeof description === "function"
                      ? description(baseModeList)
                      : description}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
        <div className={`${styles.faqMobileContainer} flex flex-col`}>
          <div className="border-[1px] border-[var(--dark-3)] rounded-[16px]">
            {whyUsList.map((item: any, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`border-b border-[var(--dark-3)] last:border-b-0 ${index === 0 ? "rounded-t-[16px]" : index === whyUsList.length - 1 ? "rounded-b-[16px]" : ""}`}
              >
                <div
                  className={`w-full flex flex-col gap-[10px] cursor-pointer py-4 px-4 text-left bg-white hover:bg-[var(--fill-3)] transition-colors
                  ${index === 0 ? "rounded-t-[16px]" : index === whyUsList.length - 1 ? "rounded-b-[16px]" : ""}`}
                  onClick={() => {
                    if (currentIndex !== index) {
                      setCurrentIndex(index);
                    }
                  }}
                >
                  <div className="font-h5 text-[var(--black)]">
                    {currentIndex === index
                      ? item.selectTitle
                      : item.unSelectTitle}
                  </div>
                  {currentIndex === index
                    ? index === 0
                      ? item.subTitle(baseModeList.length)
                      : item.subTitle
                    : ""}
                </div>
                {currentIndex === index &&
                  whyUsList[currentIndex].description && (
                    <div
                      className={`${styles.descriptionMobileContainer} flex-1 w-full ${index === whyUsList.length - 1 ? "rounded-b-[16px]" : ""}`}
                      style={{
                        background: whyUsStyles[currentIndex]?.rightbg || "",
                      }}
                    >
                      {whyUsList[currentIndex].description.map(
                        (description, index) => (
                          <div key={index} className="flex flex-row gap-4">
                            {typeof description === "function"
                              ? description(baseModeList)
                              : description}
                          </div>
                        ),
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
          {/* {whyUsList[currentIndex].description && (
            <div className={`${styles.descriptionContainer} flex-1 w-[calc(50%-16px)] min-h-[280px]`}
              style={{
                background: whyUsStyles[currentIndex]?.rightbg || "",
              }}>
              {whyUsList[currentIndex].description.map((description, index) => (
                <div key={index} className="flex flex-row gap-4">
                  {description}
                </div>
              ))}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
