import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Face Merging",
  description:
    "Novita AI utilizes advanced AI to seamlessly merge faces from multiple photos into one. Our face-merging tech creates realistic facial hybrids.",
  keywords: [
    "Stable diffusion API, face merging, face morphing, face mix, face swap, face combination",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.MERGE_FACE}
      getStartedUrl={DOCS_URL.MERGE_FACE}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.MERGE_FACE}`}
    >
      <Case />
    </Layout>
  );
}
