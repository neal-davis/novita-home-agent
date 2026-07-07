"use client";

import WanI2VDemo from "@/app/components/demos/Wan-i2v";
import CaseWrapper from "../../../model-api/product/components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        Try the Wan2.1 I2V API Demo
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
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.WAN_I2V.name}`}>
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to unlock more features.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.WAN_I2V}
        renderCase={(props) => {
          return <WanI2VDemo {...props} />;
        }}
      />
    </div>
  );
}
