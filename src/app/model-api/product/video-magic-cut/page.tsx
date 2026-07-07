import Case from "./Case";
import { Metadata } from "next";
import Layout from "../components/Layout_new";
import styles from "../style.module.scss";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title:
    "Video-Magic-Cut API - Automatically Edit Videos with AI Special Effects",
  description:
    "Video-magic-cut is a fully automated AI video editing API that applies magical filters and effects to footage instantly. It identifies the subject and adds dazzling special effects like portrait relighting, slow-mo, speed ramps, Picture-in-Picture, and more.",
  keywords: [
    "AI video editing, automatic video editing, automatic video director, magic video effects, auto video highlights, pro movie filters, self-editing video, smart video assistant, automatic video summarization, video hyperlapse, portrait relighting",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      title={<>Novita AI | {FUNC_DISPLAY_NAME.VIDEO_MAGIC_CUT}</>}
      operateBtns={
        <>
          <a
            className={styles.waitlist_btn}
            id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
            target="_blank"
            href={GOOGLE_FORM_URL.VIDEO_MAGIC_CUT}
          >
            {`Apply for Access`}
          </a>
        </>
      }
    >
      <Case />
    </Layout>
  );
}
