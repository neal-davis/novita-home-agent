"use client";

import commonStyle from "../style.module.scss";
import VideoBaseCase from "../components/video/BaseCase";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        {FUNC_DISPLAY_NAME.VIDEO_UPSCALE} Showcase
      </h2>
      <VideoBaseCase
        oriVideoUrl="/product/videos/video-upscale/origin.mp4"
        resultVideoUrl="/product/videos/video-upscale/result.mp4"
        autoPlay={true}
        loop={true}
      />
    </div>
  );
}
