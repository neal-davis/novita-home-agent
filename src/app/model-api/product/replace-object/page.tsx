import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Object Replacement",
  description:
    "Novita AI utilizes advanced AI to realistically replace objects in photos with other objects of your choosing. Seamlessly integrate any object into images.",
  keywords: [
    "Stable diffusion API, object replacement, object substitution, change object, replace object, photo object editor",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.REPLACE_OBJECT}
      getStartedUrl={DOCS_URL.REPLACE_OBJECT}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.REPLACE_OBJECT}`}
    >
      <Case />
    </Layout>
  );
}
