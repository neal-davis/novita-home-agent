import Case from "./Case";
import { Metadata } from "next";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import Layout from "../components/Layout_new";
import styles from "../style.module.scss";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title:
    "Novita AI - Build Voice Recognition into Any App with Our Flexible Speech to Text Solution",
  description:
    "Speech2txt  provides a simple and powerful voice recognition API to convert speech to text. Our API allows developers to integrate accurate speech transcription capabilities into their applications with just a few lines of code. With Speech2txt, developers can build voice-controlled features into apps across domains like healthcare, automotive, smart home and more.",
  keywords: [
    "voice recognition api, speech to text api, voice transcription api, speech transcription api, voice api, speech recognition api, build voice apps, voice enabled apps, voice controlled apps, voice control, speech recognition, conversational ai, voice ui, voice user interface, spoken language processing, automatic speech recognition",
  ],
};

export default function Page() {
  return (
    <Layout
      title={<>Novita AI | {FUNC_DISPLAY_NAME.SPEECH2TXT}</>}
      metadata={metadata}
      // docUrl={DOCS_URL.SPEECH2TXT}
      // getStartedUrl={DOCS_URL.SPEECH2TXT}
      // playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.SPEECH2TXT}`}
      operateBtns={
        <>
          <a
            className={styles.waitlist_btn}
            id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
            target="_blank"
            href={GOOGLE_FORM_URL.SPEECH2TXT}
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
