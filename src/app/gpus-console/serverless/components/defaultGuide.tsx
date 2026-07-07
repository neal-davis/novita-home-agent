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
            <div className="w-2 h-2">
              <img
                src="/gpu-instance/instances/icon-serverless.svg"
                alt="instance"
                className="w-2 h-2"
              />
            </div>
            <div className={styles.title_text}>{"SERVERLESS READY"}</div>
          </div>
          <div className={styles.content_text}>
            {
              "Multiple mixed resource types with one-click deployment and auto scaling—choose"
            }{" "}
            <span className="text-[var(--brand-0)]">{"Serverless"}</span>
          </div>
          <div className={styles.content_desc}>
            {
              "Built for lightweight scenarios with fast deployment, elastic usage, and multiple workloads."
            }
          </div>
          <div>
            <Button
              variant="default"
              className="h-9 px-4 mr-3"
              size="lg"
              onClick={() =>
                router.push(
                  getLocalizedPath(
                    NOVITA_URL.GPU_CONSOLE_SERVERLESS_DEPLOY,
                    locale,
                  ),
                )
              }
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
                window.open(DOCS_URL.SERVERLESS, "_blank");
              }}
            >
              <span className="font-subtle-medium mr-1 text-[var(--black)]">
                Learn More
              </span>
              <SquareArrowOutUpRight className="w-4 h-4 text-[var(--black)]" />
            </Button>
          </div>
        </div>
        <div
          style={{
            scale: 0.9,
          }}
        >
          <ServerlessReadyAnimation />
        </div>
      </div>
    </div>
  );
}
