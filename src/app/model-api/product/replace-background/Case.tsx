"use client";

import ReplaceBackground from "@/app/components/demos/ReplaceBackground/ReplaceBackground";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        Try replace background API demo
      </h2>
      <div className={`font-p text-center`}>
        Replace the image background with a prompt. Visit the{" "}
        <a
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.REPLACE_BACKGROUND.name}`}
        >
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features and{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.REPLACE_BACKGROUND}
        renderCase={(props) => {
          return <ReplaceBackground {...props} />;
        }}
      />
    </div>
  );
}
