import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Image Cleanup and Enhancement",
  description:
    "Novita AI uses advanced AI to clean up and enhance your images. Our powerful algorithms remove blemishes, noise, and defects while sharpening details for stunning results.",
  keywords: [
    "Stable diffusion API, image clean up, photo enhancement, image noise reduction, image processing, photo restoration",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.CLEANUP}
      getStartedUrl={DOCS_URL.CLEANUP}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.CLEANUP}`}
    >
      <Case />
    </Layout>
  );
}
