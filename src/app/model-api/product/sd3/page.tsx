import Case from "./Case";
import { DOCS_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";
import sd3styles from "../components/sd3/SD3.module.scss";

export const metadata: Metadata = {
  title: "Unleash the Power of Stable Diffusion 3 Medium for Developers",
  description:
    "Novita AI API empowers developers to harness the power of Stable Diffusion 3 Medium. Seamlessly integrate our advanced AI image generation API into your projects. Unlock new creative potential and possibilities.",
  keywords: [
    "Novita AI SDK, Stable Diffusion 3 Medium, AI image generation API, generative AI, developer tools, visual AI, AI-powered creativity, advanced image creation",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      title="Stable Diffusion 3 Medium Now Available On Novita AI"
      desc={
        <div className={sd3styles.description}>
          <p>
            Novita AI now supports Stable Diffusion 3 Medium, the text-to-image
            model with greatly improved performance
          </p>
          <p>
            in multi-subject prompts, image quality, and spelling abilities.
          </p>
        </div>
      }
      docUrl={DOCS_URL.SD3}
      getStartedUrl={DOCS_URL.SD3}
    >
      <Case />
    </Layout>
  );
}
