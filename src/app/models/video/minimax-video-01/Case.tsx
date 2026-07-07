"use client";

import MinimaxVideo01 from "@/app/components/demos/MinimaxVideo01";
import CaseWrapper from "../../../model-api/product/components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        Try MiniMax Video 01 T2V & I2V API Demo
      </h2>
      <div className={`font-p text-center`}>
        Join our{" "}
        <a
          target="_blank"
          href={"https://discord.com/invite/Fn3peMYMQf"}
          style={{ textDecoration: "underline" }}
        >
          <strong>discord</strong>
        </a>{" "}
        for support and explore the{" "}
        <a
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.MINIMAX_VIDEO_01.name}`}
        >
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to unlock more features.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.MINIMAX_VIDEO_01}
        renderCase={(props) => {
          return <MinimaxVideo01 {...props} />;
        }}
      />
    </div>
  );
}
