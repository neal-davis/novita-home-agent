import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Sky Replacement",
  description:
    "Novita AI utilizes advanced AI to realistically replace skies in photos with stunning new skies. Choose from a variety of beautiful sky images.",
  keywords: [
    "Stable diffusion API, sky replacement, sky changer, replace sky, photo sky editor, new sky",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.REPLACE_SKY}
      getStartedUrl={DOCS_URL.REPLACE_SKY}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.REPLACE_SKY}`}
    >
      <Case />
    </Layout>
  );
}
