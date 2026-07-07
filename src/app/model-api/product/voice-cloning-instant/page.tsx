import Case from "./Case";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import Layout from "../components/Layout_new";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title:
    "Voice Cloning - Instant API - Create Cloned Voices from any Speaker Instantly",
  description:
    "Voice cloning instant API is an AI voice cloning service that allows generating synthetic voices cloned from any speaker, with just a few minutes of reference audio. Our API analyzes sample speech to extract the unique characteristics of a speaker's voice quality, accent, pronunciation and intonation. With this data, our voice models can synthesize new speech mimicking the source speaker with human-like naturalness.",
  keywords: [
    "voice cloning, synthetic voice cloning, personalized voice cloning, reference audio, speaker adaptation, speaker embedding, neural voice cloning, voice modeling, target voice, source separation, speech synthesis",
  ],
};

export default function Page() {
  return (
    <Layout
      title={<>Novita AI | {FUNC_DISPLAY_NAME.VOICE_CLONING_INSTANT}</>}
      metadata={metadata}
      // docUrl={DOCS_URL.VOICE_CLONING_INSTANT}
      // getStartedUrl={DOCS_URL.VOICE_CLONING_INSTANT}
      // playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.VOICE_CLONING_INSTANT}`}
      operateBtns={
        <Button
          id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
          style={{ height: 62, padding: "0 30px", fontSize: 28 }}
          asChild
        >
          <Link target="_blank" href={GOOGLE_FORM_URL.VOICE_CLONING_INSTANT}>
            {`Apply for Access`}
          </Link>
        </Button>
      }
    >
      <Case />
    </Layout>
  );
}
