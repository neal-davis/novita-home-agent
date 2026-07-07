import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Doodle Creation",
  description:
    "Novita AI utilizes advanced AI to generate fun, unique doodle art from your photos. Our algorithms add playful doodles and drawings to any image.",
  keywords: [
    "Stable diffusion API,  doodle generator, doodle creator, doodle art, photo doodling, doodle effects",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.DOODLE}
      getStartedUrl={DOCS_URL.DOODLE}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.DOODLE}`}
    >
      <Case />
    </Layout>
  );
}
