"use client";

import Inpainting from "@/app/components/demos/Inpainting/Inpainting";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try inpainting API demo</h2>
      <div className={`font-p text-center`}>
        Fix small defects of an image with{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>. Visit
        the{" "}
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.INPAINTING.name}`}>
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.INPAINTING}
        renderCase={(props) => {
          return <Inpainting {...props} />;
        }}
      />
    </div>
  );
}
