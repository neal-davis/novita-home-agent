import Case from "./Case";
import { Metadata } from "next";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import Layout from "../components/Layout_new";
import styles from "../style.module.scss";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title:
    "VoiceTranslate API - Real-time Speech Translation for Conversational Apps",
  description:
    "VoiceTranslate provides an AI-powered audio translation API to transcribe and translate speech in real-time. Our API allows developers to add multilingual speech translation to applications with just a few lines of code.",
  keywords: [
    "speech translation api, real-time translation api, language translation api, voice translation api, audio translation api, translator api, transcription translation, simultaneous translation, conversational translation, voice transcription, multilingual apps, global communication tools, localization, internationalization",
  ],
};

export default function Page() {
  return (
    <Layout
      title={<>Novita AI | {FUNC_DISPLAY_NAME.SPEECH2TXT_TRANSLATE}</>}
      metadata={metadata}
      // docUrl={DOCS_URL.SPEECH2TXT_TRANSLATE}
      // getStartedUrl={DOCS_URL.SPEECH2TXT_TRANSLATE}
      // playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.SPEECH2TXT_TRANSLATE}`}
      operateBtns={
        <>
          <a
            className={styles.waitlist_btn}
            id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
            target="_blank"
            href={GOOGLE_FORM_URL.SPEECH2TXT_TRANSLATION}
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
