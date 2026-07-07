"use client";
import styles from "./createComplish.module.scss";
import * as iconData from "./complish/data.json";
import React from "react";
import Modal from "@/app/components/Modal/Modal";
import CreateComplishContent from "../../components/createComplishContent";

export default React.memo(function CreateComplish({
  finishForm,
}: {
  finishForm: () => void;
}) {
  return (
    <Modal
      {...{
        closeIcon: null,
        centered: true,
        width: "auto",
        className: styles.complishModal,
        footer: null,
        open: true,
        title: null,
        maskClosable: false,
        onCancel: () => finishForm(),
      }}
    >
      <CreateComplishContent
        animationData={iconData}
        classNames={styles}
        finishForm={finishForm}
        primaryButtonText={"Application"}
        redirectPath="/gpus-console/instances"
        redirectTips={"Redirecting to My Instances ......"}
        secondaryButtonText={"My Instances"}
        subtitle={
          "Your application is being created using your selected setup. It'll be ready shortly—view it in the console."
        }
        title={"Deployed"}
      />
    </Modal>
  );
});
