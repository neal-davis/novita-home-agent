import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Latent Consistency Model for Text to Image Creation",
  description:
    "Novita AI harnesses advanced AI to generate stunning visuals from text. Our text-to-image generator leverages the Latent Consistency Model to create coherent, high-quality images that unlock your imagination.",
  keywords: [
    "Stable diffusion API, text to image, image generation, ai art generator, text to image generator, Latent Consistency Model",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.LCM_TXT2IMG}
      getStartedUrl={DOCS_URL.LCM_TXT2IMG}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.LCM_TXT2IMG}`}
    >
      <Case />
    </Layout>
  );
}
