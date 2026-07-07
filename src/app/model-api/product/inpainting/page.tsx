import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Imagine More with AI Inpainting",
  description:
    "Novita AI brings AI inpainting to the masses. Our inpainting tool uses  ai art generator to seamlessly fill in missing or unwanted parts of images, allowing you to repair and refine photos with a few clicks.",
  keywords: [
    "Stable diffusion API, image inpainting, photo inpainting, AI inpainting, neural inpainting, content aware fill, remove object from photo, remove background, image repair",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.INPAINTING}
      getStartedUrl={DOCS_URL.INPAINTING}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.INPAINTING}`}
    >
      <Case />
    </Layout>
  );
}
