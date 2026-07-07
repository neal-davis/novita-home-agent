"use client";

import { Button } from "@/components/ui/button";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type CreateComplishClassNames = Record<string, string>;

type CreateComplishContentProps = {
  animationData: unknown;
  classNames: CreateComplishClassNames;
  finishForm: () => void;
  primaryButtonText: ReactNode;
  redirectPath: string;
  redirectTips: ReactNode;
  secondaryButtonText: ReactNode;
  subtitle: ReactNode;
  title: ReactNode;
};

export default function CreateComplishContent({
  animationData,
  classNames,
  finishForm,
  primaryButtonText,
  redirectPath,
  redirectTips,
  secondaryButtonText,
  subtitle,
  title,
}: CreateComplishContentProps) {
  const { locale } = useI18n();
  const [progress, setProgress] = useState(0);
  const [createSuccess] = useState("Resolved");
  const [time, setTime] = useState(6000);

  const toOtherPage = useCallback(
    (url: string) => {
      if (typeof window !== "undefined") {
        window.location.href = getLocalizedPath(url, locale);
      }
    },
    [locale],
  );

  useEffect(() => {
    let timerHandler: ReturnType<typeof setTimeout> | undefined;
    if (time > 0) {
      timerHandler = setTimeout(() => {
        setTime((currentTime) => currentTime - 10);
        setProgress((oldProgress) => {
          if (createSuccess === "Rejected") {
            return oldProgress;
          }
          const diff = 0.166;
          if (oldProgress + diff >= 100) {
            if (createSuccess === "Resolved") {
              clearTimeout(timerHandler);
              toOtherPage(redirectPath);
            }
            return 100;
          }
          return Math.min(oldProgress + diff, 100);
        });
      }, 10);
    }
    if (time <= 0) {
      clearTimeout(timerHandler);
      if (createSuccess === "Resolved") {
        toOtherPage(redirectPath);
      }
    }
    return () => {
      if (timerHandler) {
        clearTimeout(timerHandler);
      }
    };
  }, [createSuccess, redirectPath, time, toOtherPage]);

  return (
    <div className={classNames.subContainer} style={{ position: "relative" }}>
      <div className={classNames.splitor}></div>
      <div className={classNames.section}>
        <h1 className={classNames.title}>{title}</h1>
        <div>
          <div className={classNames.deploySubTitle}>{subtitle}</div>
          <div
            style={{
              marginTop: "var(--spacing-console-24)",
            }}
          >
            <Lottie
              width="100%"
              loop
              autoplay
              animationData={animationData}
            ></Lottie>
          </div>
          <div
            style={{
              marginTop: "var(--spacing-console-24)",
              marginBottom: "var(--spacing-console-12)",
            }}
          >
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--gray-2)]">
              <div
                className="h-full rounded-full bg-[var(--brand-0)]"
                style={{
                  width: `${Math.max(0, Math.min(100, progress))}%`,
                }}
              />
            </div>
          </div>
          <div className={classNames.deployTips}>{redirectTips}</div>

          <div className={classNames.btnContainer}>
            <Button
              onClick={() => finishForm()}
              className={classNames.deployGPUCloudBtn}
              variant="default"
            >
              <span className={classNames.deployGPUCloudBtnTxt}>
                {primaryButtonText}
              </span>
            </Button>
            <Button
              onClick={() => toOtherPage(redirectPath)}
              className={classNames.deployMyInstanceBtn}
              variant="default"
            >
              <span className={classNames.deployMyInstanceBtnTxt}>
                {secondaryButtonText}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
