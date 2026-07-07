import * as React from "react";
import Link from "next/link";
import ApiCard from "./ApiCard";
import CodeBlock from "./CodeBlock";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { Button } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./integration.module.scss";
export default function ApiIntegration({ copy }: { copy?: unknown }) {
  return (
    <main className={styles.page_wrap}>
      <div className={`${styles.content} max_width_container`}>
        <div className={styles.info}>
          <h3 className="font-h3 text-[var(--dark-1)]">
            {"Integrate Llama 3 API with Your Application"}
          </h3>
          <div className="font-body text-[var(--dark-1)]">
            {
              "We provide compatibility with the OpenAI API standard, allowing for easier integration into your existing applications."
            }
          </div>
          <div className="flex flex-col items-stretch gap-[8px]">
            <ApiCard
              title={"API Base URL"}
              content={
                <span className="font-body underline">
                  {"https://api.novita.ai/openai"}
                </span>
              }
            />
            <ApiCard
              title={"Supported Models"}
              content={
                <>
                  Check the full list of supported models{" "}
                  <Link
                    href="https://novita.ai/llm-api"
                    className="font-body text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    here
                  </Link>{" "}
                  or use the Models API to get all available models.
                </>
              }
            />
          </div>
          <Button
            id={CLICK_BTN_IDs.LLAMA3_PAGE_BTNS.INTEGRATE_API_KEY}
            asChild
            style={{ width: 138, height: 32 }}
          >
            <Link href={NOVITA_URL.KEYS}>{"Get API Key"}</Link>
          </Button>
        </div>
        <div className={styles.code_wrap}>
          <CodeBlock />
        </div>
      </div>
    </main>
  );
}
