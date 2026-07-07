"use client";

import KlingV16I2v from "@/app/components/demos/KlingV16I2v";
import CaseWrapper from "../../../model-api/product/components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try Kling V1.6 I2V Demo</h2>
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
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.KLING_V1_6_I2V.name}`}
        >
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to unlock more features.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.KLING_V1_6_I2V}
        renderCase={(props) => {
          return <KlingV16I2v {...props} />;
        }}
      />
    </div>
  );
}
