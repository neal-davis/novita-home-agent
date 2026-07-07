import Case from "./Case";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";
import { GOOGLE_FORM_URL } from "@/constants/urls";
import Layout from "../components/Layout_new";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export const metadata: Metadata = {
  title: "ProVoice API - Lifelike Voice Cloning for any Speaker",
  description:
    "ProVoice is an AI voice cloning platform that generates highly realistic synthetic voices from audio samples of any real person. Using advanced neural networks, ProVoice analyzes speech nuances like timbre, accent, pronunciation and emotional delivery to clone the unique qualities of a reference speaker. The cloned voices sound natural, expressive and consistent across different texts.",
  keywords: [
    "professional voice cloning, reference speaker cloning, neural voice modeling, personalized text-to-speech, synthetic speech generation, voice casting, voice over cloning, target voice adaptation, speaker embedding, voice conversion, voice synthesis",
  ],
};

export default function Page() {
  return (
    <Layout
      title={<>Novita AI | {FUNC_DISPLAY_NAME.VOICE_CLONING}</>}
      metadata={metadata}
      operateBtns={
        <Button
          id={CLICK_BTN_IDs.PRODUCT_APPLY_BTN_ID}
          style={{ height: 62, padding: "0 30px", fontSize: 28 }}
          asChild
        >
          <Link target="_blank" href={GOOGLE_FORM_URL.VOICE_CLONING}>
            {`Apply for Access`}
          </Link>
        </Button>
      }
    >
      <Case />
    </Layout>
  );
}
