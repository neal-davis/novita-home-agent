import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { BREVO_BOOK_LINK } from "@/constants/urls";
import styles from "./Head.module.scss";
import { NOVITA_URL } from "@/constants/urls";
export default function Head({ copy }: { copy?: unknown }) {
  return (
    <div className={`${styles.page}`}>
      <div className="max_width_container">
        <div className={styles.main}>
          <h1 className={styles.title}>{"Save Up to 70% with Llama 3 API"}</h1>
          <h2 className={styles.desc}>
            {"Unmatched performance and reliability at an unbeatable cost."}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              style={{
                height: 40,
                width: 205,
              }}
              asChild
            >
              <Link
                className={styles.dropdown_item}
                id={CLICK_BTN_IDs.LLAMA3_PAGE_BTNS.TRY}
                href={`${NOVITA_URL.MODEL_API_LLM_PLAYGROUND}#meta-llama-llama-3.1-8b-instruct`}
                target="_blank"
              >
                <span>{"Try Our Playground"}</span>
              </Link>
            </Button>
            <Button
              style={{
                height: 40,
                width: 138,
              }}
              asChild
              variant="outline"
            >
              <Link
                className={styles.dropdown_item}
                id={CLICK_BTN_IDs.LLAMA3_PAGE_BTNS.BOOK}
                href={BREVO_BOOK_LINK}
                target="_blank"
              >
                <span>{"Book a Call"}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
