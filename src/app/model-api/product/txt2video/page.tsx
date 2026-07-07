import Case from "./Case";
import { Metadata } from "next";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import commonStyle from "../style.module.scss";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Novita AI - Transform Text to Video Easily | AI Text to Video Tool",
  description:
    "Empower your development projects with our AI Text-to-Video API. Convert text into engaging videos effortlessly with our advanced AI Text-to-video tool. Explore Novita AI's developer-friendly solution today. Try it now!",
  keywords: [
    "AI text to video, text to video ai, text to video, ai tool to convert text to video, text to video api, text-based video converter",
  ],
};

export default function Page() {
  return (
    <Layout
      title={
        <>
          Enhance Your Visual Content with{" "}
          <span className={commonStyle.inline}>Stable Video Diffusion</span>{" "}
          Text-to-Video API
        </>
      }
      metadata={metadata}
      docUrl={DOCS_URL.TXT2VIDEO}
      getStartedUrl={DOCS_URL.TXT2VIDEO}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.TXT2VIDEO}`}
    >
      <Case />
    </Layout>
  );
}
