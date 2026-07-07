"use client";

import Cleanup from "@/app/components/demos/Cleanup/Cleanup";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try cleanup API demo</h2>
      <div className={`font-p text-center`}>
        Cleanup an area of the image. Visit the{" "}
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.CLEANUP.name}`}>
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features and{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.CLEANUP}
        renderCase={(props) => {
          return <Cleanup {...props} />;
        }}
      />
    </div>
  );
}
