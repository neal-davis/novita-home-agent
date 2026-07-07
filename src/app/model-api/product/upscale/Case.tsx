"use client";

import Upscale from "@/app/components/demos/Upscale/Upscale";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try Upscale API demo</h2>
      <div className={`font-p text-center`}>
        Improves the quality of images with{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>. Visit
        the{" "}
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.UPSCALE.name}`}>
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.UPSCALE}
        renderCase={(props) => {
          return <Upscale {...props} />;
        }}
      />
    </div>
  );
}
