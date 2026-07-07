import Case from "./Case";
import { Metadata } from "next";
import Layout from "../components/Layout_new";
import styles from "../style.module.scss";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title: "Video-Remove-Object API - Easily Erase Objects from Videos at Scale",
  description:
    "The video-remove-object API provides a seamless way to detect and delete unwanted objects, logos, or other elements from source video files leaving a clean background. Powered by advanced computer vision, our fully automated API can remove objects of any shape, size, or color accurately across various scenes and backgrounds.",
  keywords: [
    "video object removal, video editing API, digital removal, computer vision, visual effect, selective editing, intelligent Video analytics, computer graphics, visual tracking, crowd removal, sticker removal, automated video production",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      title={<>Novita AI | {FUNC_DISPLAY_NAME.VIDEO_REMOVE_OBJECT}</>}
      operateBtns={
        <>
          <a
            className={styles.waitlist_btn}
            id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
            target="_blank"
            href={GOOGLE_FORM_URL.VIDEO_REMOVE_OBJECT}
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
