"use client";

import MinimaxHailuo02 from "@/app/components/demos/MinimaxHailuo02";
import CaseWrapper from "../../../model-api/product/components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        MiniMax Hailuo 02 T2V & I2V
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
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.MINIMAX_HAILUO_02.name}`}
        >
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to unlock more features.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.MINIMAX_HAILUO_02}
        renderCase={(props) => {
          return <MinimaxHailuo02 {...props} />;
        }}
      />
    </div>
  );
}
