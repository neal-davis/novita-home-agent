"use client";

import Demo from "../components/sdxl-turbo/Case";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try SDXL-Turbo</h2>
      <div className={`font-p text-center`}>
        Join our{" "}
        <a
          target="_blank"
          href={"https://discord.com/invite/Fn3peMYMQf"}
          style={{ textDecoration: "underline" }}
        >
          <strong>discord server</strong>
        </a>{" "}
        to learn more.
      </div>
      <CaseWrapper
        funcInfo={FUNCS.IMG2VIDEO}
        renderCase={() => {
          return <Demo />;
        }}
      />
    </div>
  );
}
