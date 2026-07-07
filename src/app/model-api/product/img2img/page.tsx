import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Innovative AI for Image Generation",
  description:
    "Novita AI utilizes powerful AI to transform images into stunning visuals. Simply upload a photo and our image-to-image generator will synthesize it into an entirely new creative work of art.",
  keywords: [
    "Stable diffusion API, image to image, image generation, AI art creator, photo to art generator, ai art generator",
  ],
};

export default function Page() {
  return (
    <Layout
      title="Innovative AI for Image Generation"
      desc="Novita AI utilizes powerful AI to transform images into stunning visuals. Simply upload a photo and our image-to-image generator will synthesize it into an entirely new creative work of art."
      metadata={metadata}
      docUrl={DOCS_URL.IMG2IMG}
      getStartedUrl={DOCS_URL.IMG2IMG}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.IMG2IMG}`}
    >
      <Case />
    </Layout>
  );
}
