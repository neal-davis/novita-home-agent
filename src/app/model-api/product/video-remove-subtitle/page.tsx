import Case from "./Case";
import { Metadata } from "next";
import Layout from "../components/Layout_new";
import styles from "../style.module.scss";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title:
    "Video-Remove-Subtitles API - Easily Remove subtitles from Videos at Scale",
  description:
    "The video-remove-subtitles API provides a simple yet powerful solution to remove unwanted subtitles or closed captions from video files. Our fully-automated API can scrub subtitles from videos of any format, resolution or length within seconds.",
  keywords: [
    "subtitle removal, caption removal, subtitling, closed captioning, multimedia processing, video cleaning, video processing, video transcription, video automation, cloud video services, bulk video conversion",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      title={<>Novita AI | {FUNC_DISPLAY_NAME.VIDEO_REMOVE_SUBTITLE}</>}
      operateBtns={
        <>
          <a
            className={styles.waitlist_btn}
            id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
            target="_blank"
            href={GOOGLE_FORM_URL.VIDEO_REMOVE_SUBTITLE}
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
