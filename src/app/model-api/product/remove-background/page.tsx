import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Background Removal",
  description:
    "Novita AI utilizes advanced AI to instantly remove image backgrounds with incredible accuracy. Get professional results in one click.",
  keywords: [
    "Stable diffusion API, background remover, image background remover, photo background remover, background eraser, image background erase",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.REMOVE_BACKGROUND}
      getStartedUrl={DOCS_URL.REMOVE_BACKGROUND}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.REMOVE_BACKGROUND}`}
    >
      <Case />
    </Layout>
  );
}
