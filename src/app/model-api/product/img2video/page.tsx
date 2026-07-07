import Case from "./Case";
import { Metadata } from "next";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import commonStyle from "../style.module.scss";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title:
    "Enhance Your Visual Content with Stable Video Diffusion Image-to-Video API",
  description:
    "Novita AI, unlock the power of Stable Video Diffusion Image-to-Video API and take your visual content to the next level. This cutting-edge model offers a seamless transformation of images into captivating videos. With support for 14 or 25 frames at 1024*576 resolution, multi-view generation, frame interpolation, 3D scene understanding, and camera control via LoRA, you have the tools to create dynamic and engaging videos. Boost your content strategy today!",
  keywords: [
    "Stable diffusion API, stable diffusion video, stable diffusion video generation, stable diffusion ai video to video free, Image-to-Video API, text-to-video, image-to-video conversion, multi-view generation",
  ],
};

export default function Page() {
  return (
    <Layout
      title={
        <>
          Enhance Your Visual Content with{" "}
          <span className={commonStyle.inline}>Stable Video Diffusion</span>{" "}
          Image-to-Video API
        </>
      }
      metadata={metadata}
      docUrl={DOCS_URL.IMG2VIDEO}
      getStartedUrl={DOCS_URL.IMG2VIDEO}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.IMG2VIDEO}`}
    >
      <Case />
    </Layout>
  );
}
