import Case from "./Case";
import { Metadata } from "next";
import Layout from "../components/Layout_new";
import styles from "../style.module.scss";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title: "Video-Upscale - AI Video Upscaling for Quality on Any Device",
  description:
    "Video-upscale API uses deep learning to enhance low-resolution video in real time without losing quality or clarity. Our API can upscale videos to 4K/HD while maintaining fine textures and natural movements.",
  keywords: [
    "AI video upscaling, video super resolution, video enhancement, video remastering, transcoding, format conversion, resolution conversion, deep learning video processing, image processing API, cloud-based media services, video optimization, video upres, enhance low res video",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      title={<>Novita AI | {FUNC_DISPLAY_NAME.VIDEO_UPSCALE}</>}
      operateBtns={
        <>
          <a
            className={styles.waitlist_btn}
            id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
            target="_blank"
            href={GOOGLE_FORM_URL.VIDEO_UPSCALE}
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
