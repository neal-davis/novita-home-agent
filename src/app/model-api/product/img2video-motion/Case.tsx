"use client";

import Demo from "@/app/components/demos/MotionSync/MotionSync";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS, { FUNC_NAME } from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        Try Image to Video - Motion API demo
      </h2>
      <div className={`font-p text-center`}>
        Animate the image adhering to the motion sequences. Visit the{" "}
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.MOTIONSYNC.name}`}>
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features and{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.MOTIONSYNC}
        renderCase={(props) => {
          return <Demo funcName={FUNC_NAME.MOTIONSYNC} {...props} />;
        }}
      />
    </div>
  );
}
