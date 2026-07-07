import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Reimagine Your Potential with AI-powered Portrait Tools",
  description:
    "Novita AI offers intuitive AI tools to reimage and transform portraits in creative new ways. With just a few clicks, you can generate likenesses from different eras, genders, or even anime/cartoon styles. Unleash your imagination!",
  keywords: [
    "Stable diffusion API, AI portrait maker, generative art, style transfer, anime portrait, era portrait, creative portraits, imagination tools, reimage photos",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.REIMAGINE}
      getStartedUrl={DOCS_URL.REIMAGINE}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.REIMAGINE}`}
    >
      <Case />
    </Layout>
  );
}
