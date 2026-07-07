"use client";

import MergeFace from "@/app/components/demos/MergeFace/MergeFace";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try merge face API demo</h2>
      <div className={`font-p text-center`}>
        Blend the details of two faces. Visit the{" "}
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.MERGE_FACE.name}`}>
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features and{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.MERGE_FACE}
        renderCase={(props) => {
          return <MergeFace {...props} />;
        }}
      />
    </div>
  );
}
