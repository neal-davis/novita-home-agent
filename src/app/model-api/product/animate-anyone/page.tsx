import Case from "./Case";
import { Metadata } from "next";
import { FUNC_NAME } from "@/app/models/constants/funcs";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import commonStyle from "../style.module.scss";
import Layout from "../components/Layout_new";

export const metadata: Metadata = {
  title: "Consistent and Controllable Character Animation with Novita AI",
  description:
    "Novita AI provides a powerful yet simple API for image-to-video synthesis and character animation. Our deep learning models analyze source images and animation controls to synthesize realistic videos frame-by-frame. Developers have full control over factors like emotion, movement, duration and camera angles to bring still characters to life in a consistent manner.",
  keywords: [
    "anime api, animation controls, movement control, image to video ai, video to image sequence, animation motion revolution, stop motion animation movies, male anime characters",
  ],
};

export default function Page() {
  return (
    <Layout
      title={
        <>
          Apply motion to your image with{" "}
          <span className={commonStyle.inline}>Animate Anyone</span> API
        </>
      }
      metadata={metadata}
      docUrl={DOCS_URL.ANIMATE_ANYONE}
      getStartedUrl={DOCS_URL.ANIMATE_ANYONE}
      playgroundUrl={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.ANIMATE_ANYONE}`}
    >
      <Case />
    </Layout>
  );
}
