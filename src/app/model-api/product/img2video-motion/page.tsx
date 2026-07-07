import Case from "./Case";
import { Metadata } from "next";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import commonStyle from "../style.module.scss";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Apply motion to your image with Image to Video - Motion API",
  description:
    "Unleash the power of Image-to-Video-Motion API from Novita AI and bring your static images to life! This incredible API can animate the reference image adhering to the motion sequences with temporal consistency, enhancing your content strategy significantly. Start boosting your content today!",
  keywords: [
    "Stable diffusion API, stable diffusion video, video generation, stable diffusion ai image to video free, Image-to-Video-Motion API, text-to-video, image-to-video conversion, multi-view generation",
  ],
};

export default function Page() {
  return (
    <Layout
      title={
        <>
          Apply motion to your image with{" "}
          <span className={commonStyle.inline}>Image to Video - Motion</span>{" "}
          API
        </>
      }
      metadata={metadata}
      docUrl={DOCS_URL.MOTIONSYNC}
      getStartedUrl={DOCS_URL.MOTIONSYNC}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.MOTIONSYNC}`}
    >
      <Case />
    </Layout>
  );
}
