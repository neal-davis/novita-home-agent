"use client";

import LCMTxt2Img from "@/app/components/demos/LCM/LCMTxt2Img";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        Try Latent Consistency Model API demo
      </h2>
      <div className={`font-p text-center`}>
        Generate AI images with{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2> on{" "}
        <a
          style={{ textDecoration: "underline", fontWeight: 700 }}
          target="_blank"
          href="https://github.com/luosiallen/latent-consistency-model"
        >
          Latent Consistency Model
        </a>
        . Visit the{" "}
        <a
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.LCM_TXT2IMG.name}`}
        >
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.LCM_TXT2IMG}
        renderCase={(props) => {
          return <LCMTxt2Img {...props} />;
        }}
      />
    </div>
  );
}
