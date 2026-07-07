"use client";

import { useState } from "react";
import ImgSelected from "./ImgSelect";
import ImgGenerate from "./ImgInput";

export default function ImgGeneration({
  imgList,
  title,
}: {
  imgList: Array<{
    imgSrc: string;
    prompt: string;
    negative_prompt: string;
    model_name: string;
  }>;
  title: string;
}) {
  const [slected, setSelected] = useState(0);
  const selectItem = imgList[slected];
  return (
    <div>
      <ImgSelected
        imgList={imgList}
        setSelected={setSelected}
        slected={slected}
        title={title}
      />
      <ImgGenerate
        prompt={selectItem?.prompt}
        model_name={selectItem?.model_name}
        negative_prompt={selectItem?.negative_prompt}
      />
    </div>
  );
}
