import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Background Changer",
  description:
    "Novita AI uses advanced AI to seamlessly replace image backgrounds. Easily customize photos with new backgrounds in just one click.",
  keywords: [
    "Stable diffusion API, background changer, change photo background, image background editor, background editor, photo background editor.",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.REPLACE_BACKGROUND}
      getStartedUrl={DOCS_URL.REPLACE_BACKGROUND}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.REPLACE_BACKGROUND}`}
    >
      <Case />
    </Layout>
  );
}
