import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Text Removal",
  description:
    "Novita AI utilizes advanced AI to seamlessly remove text from images. Our algorithms delete text while filling the background naturally.",
  keywords: [
    "Stable diffusion API, text remover, delete text, remove text from photo, text eraser, text removal",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.REMOVE_TEXT}
      getStartedUrl={DOCS_URL.REMOVE_TEXT}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.REMOVE_TEXT}`}
    >
      <Case />
    </Layout>
  );
}
