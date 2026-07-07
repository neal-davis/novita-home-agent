"use client";

import RemoveBackground from "@/app/components/demos/RemoveBackground/RemoveBackground";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        Try remove background API demo
      </h2>
      <div className={`font-p text-center`}>
        Remove image background accurately and fast. Visit the{" "}
        <a
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.REMOVE_BACKGROUND.name}`}
        >
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features and{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.REMOVE_BACKGROUND}
        renderCase={(props) => {
          return <RemoveBackground {...props} />;
        }}
      />
    </div>
  );
}
