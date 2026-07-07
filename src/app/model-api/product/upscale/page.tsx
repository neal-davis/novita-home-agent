import Case from "./Case";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { Metadata } from "next";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Elevate Your Style with Custom Upscaling",
  description:
    "Novita AI is a fashion technology platform that provides an upscale service to empower you to elevate and customize your style. With just a click, we can upscale your favorite looks to higher-quality fabrics and tailored fits.",
  keywords: [
    "Stable diffusion API, clothing upscale, upscale fashion, upgrade clothes, custom upscaling, elevate style, tailored clothing, high quality fabrics",
  ],
};

export default function Page() {
  return (
    <Layout
      metadata={metadata}
      docUrl={DOCS_URL.TXT2IMG}
      getStartedUrl={DOCS_URL.TXT2IMG}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.TXT2IMG}`}
    >
      <Case />
    </Layout>
  );
}
