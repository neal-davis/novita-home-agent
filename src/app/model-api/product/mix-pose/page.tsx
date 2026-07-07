import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "AI-Powered Pose Mixing and Synthesis",
  description:
    "Novita AI utilizes advanced AI to seamlessly mix and match poses between human subjects. Our MixPose tech transfers pose in a photorealistic manner.",
  keywords: [
    "Stable diffusion API, pose mixing, pose transfer, pose synthesis, MixPose, pose generation",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.MIX_POSE}
      getStartedUrl={DOCS_URL.MIX_POSE}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.MIX_POSE}`}
    >
      <Case />
    </Layout>
  );
}
