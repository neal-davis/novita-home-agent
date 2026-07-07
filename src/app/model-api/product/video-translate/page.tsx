import Case from "./Case";
import { Metadata } from "next";
import Layout from "../components/Layout_new";
import styles from "../style.module.scss";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title: "Real-Time Video Translate API | Translate Video Content at Scale",
  description:
    "Our video-translate API enables developers to add automated translate capabilities to any video streaming application or platform. Powered by advanced neural machine translation models, it can transcribe and translate voice audio in videos to over 100 languages in real-time.",
  keywords: [
    "video translation API, video transcription API, video captioning API, real-time video translation, streaming video translation, video localization, live video translation, video content translation, multi-language video, automated video translation",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      title={<>Novita AI | {FUNC_DISPLAY_NAME.VIDEO_TRANSLATE}</>}
      operateBtns={
        <>
          <a
            className={styles.waitlist_btn}
            id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
            target="_blank"
            href={GOOGLE_FORM_URL.VIDEO_TRANSLATE}
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
