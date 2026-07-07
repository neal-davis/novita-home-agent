"use client";

import { Button } from "@/components/ui/button";
import styles from "./defaultGuide.module.scss";
import { useRouter } from "next/navigation";
import { ChevronRight, SquareArrowOutUpRight } from "lucide-react";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import ServerlessReadyAnimation from "./animation/animation";

export default function DefaultGuide() {
  const router = useRouter();
  const { locale } = useI18n();
  return (
    <div className="p-2">
      <h1 className={styles.title}>Need to deploy cloud resources?</h1>
      <div className={styles.content}>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-7 h-7 p-[6px]"
              style={{
                borderRadius: "8px",
                background: "rgba(208, 250, 229, 0.50)",
              }}
            >
              <img
                src="/gpu-instance/instances/icon-instance.svg"
                alt="instance"
                className="w-4 h-4"
              />
            </div>
            <div className={styles.title_text}>{"Instance"}</div>
          </div>
          <div className={styles.content_text}>
            {"For high-compute, elastic mixed workloads, use"}{" "}
            <span className="text-[var(--brand-0)]">{"GPU Instances"}</span>
            {"."}
          </div>
          <div className={styles.content_desc}>
            {
              "Ideal for high-compute, elastic mixed workloads ranging from AI training to rendering."
            }
          </div>
          <div>
            <Button
              variant="default"
              className="h-9 px-4 mr-3"
              size="lg"
              onClick={() => {
                router.push(
                  getLocalizedPath(
                    NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE,
                    locale,
                  ),
                );
              }}
            >
              <span className="font-subtle-medium mr-1 text-white">
                Deploy Now
              </span>
              <ChevronRight className="w-4 h-4 text-white" />
            </Button>
            <Button
              variant="outline"
              className="h-9 px-4"
              onClick={() => {
                window.open(DOCS_URL.GPU_INSTANCE, "_blank");
              }}
            >
              <span className="font-subtle-medium mr-1 text-[var(--black)]">
                Learn More
              </span>
              <SquareArrowOutUpRight className="w-4 h-4 text-[var(--black)]" />
            </Button>
          </div>
        </div>
        <div>
          <ServerlessReadyAnimation />
        </div>
      </div>
    </div>
  );
}
