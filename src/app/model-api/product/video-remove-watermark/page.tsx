import Case from "./Case";
import { Metadata } from "next";
import Layout from "../components/Layout_new";
import styles from "../style.module.scss";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title:
    "Video-Remove-Watermark API - Affordably Remove Watermarks from Videos at Scale",
  description:
    "The video-remove-watermark API provides a cost-effective solution to remove superimposed watermarks, logos or other overlay text from large volumes of video files. Using patented content-aware processing, our API is able to accurately detect and scrub watermarks while maintaining video quality.",
  keywords: [
    "video watermark removal, overlay removal, logo removal, embedded text removal, bulk processing, cloud workflow, video clean up, video transcoding, video filtering, DRM stripping, cloud encoding, A.I. powered video services",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      title={<>Novita AI | {FUNC_DISPLAY_NAME.VIDEO_REMOVE_WATERMARK}</>}
      operateBtns={
        <>
          <a
            className={styles.waitlist_btn}
            id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
            target="_blank"
            href={GOOGLE_FORM_URL.VIDEO_REMOVE_WATERMARK}
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
