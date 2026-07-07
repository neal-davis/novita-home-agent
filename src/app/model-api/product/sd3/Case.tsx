"use client";

import CaseWrapper from "../components/CaseWrapper/CaseWrapper";
import SD3 from "../components/sd3/SD3";

export default function Case() {
  return (
    <CaseWrapper
      apiVer="v3"
      renderCase={(props) => {
        return <SD3 {...props} />;
      }}
    />
  );
}
