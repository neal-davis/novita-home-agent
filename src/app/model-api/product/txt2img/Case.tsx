"use client";

import Txt2ImgCase from "../components/txt2img/Case";
import CaseWrapper from "../components/CaseWrapper/CaseWrapper";

export default function Case() {
  return (
    <CaseWrapper
      apiVer="v3"
      renderCase={(props) => {
        return <Txt2ImgCase {...props} />;
      }}
    />
  );
}
