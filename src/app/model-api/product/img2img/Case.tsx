"use client";

import Img2ImgCase from "../components/img2img/Case";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper";

export default function Case() {
  return (
    <CaseWrapper
      apiVer="v2"
      renderCase={(props) => {
        return <Img2ImgCase {...props} />;
      }}
    />
  );
}
