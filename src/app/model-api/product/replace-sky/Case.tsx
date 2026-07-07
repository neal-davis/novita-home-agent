"use client";

import ReplaceSky from "@/app/components/demos/ReplaceSky/ReplaceSky";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try replace sky API demo</h2>
      <div className={`font-p text-center`}>
        Replace the sky in the image. Visit the{" "}
        <a
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.REPLACE_SKY.name}`}
        >
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features and{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.REPLACE_SKY}
        renderCase={(props) => {
          return <ReplaceSky {...props} />;
        }}
      />
    </div>
  );
}
