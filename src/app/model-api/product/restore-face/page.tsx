import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Face Restoration",
  description:
    "Novita AI utilizes advanced AI to restore old, damaged faces in photos. Our algorithms enhance facial details for realistic, rejuvenated results.",
  keywords: [
    "Stable diffusion API, face restoration, photo face restoration, restore face, enhance face, face touch up",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.RESTORE_FACE}
      getStartedUrl={DOCS_URL.RESTORE_FACE}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.RESTORE_FACE}`}
    >
      <Case />
    </Layout>
  );
}
