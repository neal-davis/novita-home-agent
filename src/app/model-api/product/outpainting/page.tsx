import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Novita AI - AI-Powered Image Extender",
  description:
    "Novita AI image extender: Transform your images with AI Image Extender! Without losing quality, and automatically adjust the image size without distortion. Choose from various aspect ratios to resize images hassle-free for any social media platform or destination.",
  keywords: [
    "AI image extender, AI extend image, extend image AI, AI image extender free, image extender AI, AI expand image, AI image expander, expand image AI",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.OUTPAINTING}
      getStartedUrl={DOCS_URL.OUTPAINTING}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.OUTPAINTING}`}
    >
      <Case />
    </Layout>
  );
}
