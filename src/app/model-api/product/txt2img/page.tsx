import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Text to Image Creation Powered by AI",
  description:
    "Novita AI utilizes advanced AI technology to generate stunning visual images from text descriptions. Simply type what you want to see and our text-to-image generator will create it. Unleash your imagination!",
  keywords: [
    "Stable diffusion API, text to image, image generation, AI image creator, text to image generator, ai art generator",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.TXT2IMG}
      getStartedUrl={DOCS_URL.TXT2IMG}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.TXT2IMG}`}
    >
      <Case />
    </Layout>
  );
}
