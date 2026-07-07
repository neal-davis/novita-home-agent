"use client";

import Demo from "@/app/components/demos/MotionSync/MotionSync";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS, { FUNC_NAME } from "@/app/models/constants/funcs";
import { NOVITA_URL } from "@/constants/urls";
import commonStyle from "../style.module.scss";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        Try Animate Anyone API demo
      </h2>
      <div className="font-h6 text-center">
        Animate the image adhering to the motion sequences. Visit the{" "}
        <a
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNC_NAME.ANIMATE_ANYONE}`}
        >
          <strong style={{ textDecoration: "underline" }}>
            playground
          </strong>{" "}
        </a>{" "}
        to access more features and{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.ANIMATE_ANYONE}
        renderCase={(props) => {
          return <Demo funcName={FUNC_NAME.ANIMATE_ANYONE} {...props} />;
        }}
      />
    </div>
  );
}
