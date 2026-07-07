"use client";

import Img2VideoDemo from "@/app/components/demos/Img2Video/Img2Video";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>
        Try image to video API demo
      </h2>
      <div className={`font-p text-center`}>
        Join our{" "}
        <a
          target="_blank"
          href={"https://discord.com/invite/Fn3peMYMQf"}
          style={{ textDecoration: "underline" }}
        >
          <strong>discord server</strong>
        </a>{" "}
        to learn more. Visit the{" "}
        <a href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.IMG2VIDEO.name}`}>
          <strong style={{ textDecoration: "underline" }}>playground</strong>{" "}
        </a>{" "}
        to access more features and{" "}
        <h2 className={commonStyle.keywords_h2}>Stable Diffusion API</h2>.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.IMG2VIDEO}
        renderCase={(props) => {
          return <Img2VideoDemo {...props} />;
        }}
      />
    </div>
  );
}
