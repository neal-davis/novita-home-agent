"use client";

import styles from "./createComplish.module.scss";
import * as iconData from "./complish/data.json";
import React from "react";
import CreateComplishContent from "../../components/createComplishContent";

export default React.memo(function CreateComplish({
  instanceInfo,
  showParams,
  finishForm,
}: {
  instanceInfo: any;
  showParams: any;
  finishForm: any;
}) {
  void instanceInfo;
  void showParams;

  return (
    <CreateComplishContent
      animationData={iconData}
      classNames={styles}
      finishForm={finishForm}
      primaryButtonText={"GPU Cloud"}
      redirectPath="/gpus-console/instances"
      redirectTips={"Redirecting to My Instances ......"}
      secondaryButtonText={"My Instances"}
      subtitle={
        "Your Instance is being built as we speak. It should be ready in a few minutes!"
      }
      title={"Deployed"}
    />
  );
});
