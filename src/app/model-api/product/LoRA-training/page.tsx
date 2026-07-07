import Case from "./Case";
import { DOCS_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "LoRA Training API In Stable Diffusion",
  description:
    "Novita AI provides an easy to use platform for developers to train custom LoRA stable diffusion models at scale. Harness the power of LoRA and other stable diffusion models on your unique data.",
  keywords: [
    "LoRA model training, stable diffusion models training, Face Stylization Training, Fine Tune, deep learning platform, model training, fine tuning",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.TRAINING}
      getStartedUrl={DOCS_URL.TRAINING}
      playgroundUrl="https://colab.research.google.com/drive/1j_ii9TN67nuauvc3PiauwZnC2lT62tGF?usp=sharing"
      tryBtnTxt="Try in colab"
    >
      <Case />
    </Layout>
  );
}
