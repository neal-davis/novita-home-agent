"use client";

import commonStyle from "../style.module.scss";
import MagicCut from "../components/video/MagicCut";
import { FUNC_DISPLAY_NAME } from "@/app/models/constants/funcs";

const urls = Array.from({ length: 10 }, (_, i) => i + 1).map(
  (i) => `/product/videos/video-magic-cut/clips/${i}.mp4`,
);

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        {FUNC_DISPLAY_NAME.VIDEO_MAGIC_CUT} Showcase
      </h2>
      <MagicCut
        oriVideoUrl="/product/videos/video-magic-cut/origin.mp4"
        resultVideoUrls={urls}
      />
    </div>
  );
}
