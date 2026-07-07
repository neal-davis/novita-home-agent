"use client";

import Wan26T2v from "@/app/components/demos/Wan26-t2v";
import Wan26I2V from "@/app/components/demos/Wan26-i2v";
import Wan26V2v from "@/app/components/demos/Wan26-v2v";
import CaseWrapper from "../../../model-api/product/components/CaseWrapper/CaseWrapper_new";
import FUNCS from "@/app/models/constants/funcs";
import commonStyle from "../style.module.scss";
import { NOVITA_URL } from "@/constants/urls";

export default function Case() {
  return (
    <div className={`${commonStyle.page_container} max_width_container`}>
      <h2 className={`font-h3 text-center mb-5`}>Try the Wan 2.6 API Demos</h2>
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
          href={`${NOVITA_URL.MODEL_API_PLAYGROUND}#${FUNCS.WAN_2_6_T2V.name}`}
        >
          <strong style={{ textDecoration: "underline" }}>
            playground
          </strong>{" "}
        </a>{" "}
        to unlock more features.
      </div>
      <CaseWrapper
        demos={[
          {
            key: "t2v",
            label: "Wan 2.6 Text to Video",
            funcInfo: FUNCS.WAN_2_6_T2V,
            renderCase: (props) => <Wan26T2v {...props} />,
          },
          {
            key: "i2v",
            label: "Wan 2.6 Image to Video",
            funcInfo: FUNCS.WAN_2_6_I2V,
            renderCase: (props) => <Wan26I2V {...props} />,
          },
          {
            key: "v2v",
            label: "Wan 2.6 Reference Video (Video to Video)",
            funcInfo: FUNCS.WAN_2_6_V2V,
            renderCase: (props) => <Wan26V2v {...props} />,
          },
        ]}
        defaultActiveKey="t2v"
      />
    </div>
  );
}
