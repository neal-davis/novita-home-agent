"use client";

import styles from "./addNetworkVolume.module.scss";
// import { useState } from "react";
import { Button } from "@/components/ui/button";
import React, { type RefObject } from "react";
import Modal from "@/app/components/Modal/Modal";

export default function AddConfirm({
  openDiag = false,
  finishOper,
  price,
  mountContainerRef,
}: {
  openDiag: boolean;
  finishOper: any;
  price: any;
  /** When nested inside another modal (e.g. Radix + MUI), portal here so content is clickable. */
  mountContainerRef?: RefObject<HTMLDivElement>;
}) {
  function handleClose() {
    finishOper(false);
  }
  return (
    <React.Fragment>
      {mountContainerRef ? <div ref={mountContainerRef} /> : null}
      <Modal
        open={openDiag}
        title="Confirm Creation"
        footer={null}
        width={520}
        className={styles.addConfirmDialog}
        maskClosable={false}
        onCancel={handleClose}
      >
        <div
          style={{
            backgroundColor: "var(--white)",
            color: "var(--black)",
          }}
        >
          <div style={{ padding: "4px 0px 8px" }}>
            <div
              className={styles.sizeTip}
              style={{ marginTop: "0px", marginBottom: "16px" }}
            >
              <span className={styles.desc}>
                Network Volume is billed at ${price}/day. If your account has an
                outstanding balance and no running instances,{" "}
                {
                  <section className="inline text-[#000]">
                    your Network Volume will be released after 3 days.
                  </section>
                }
              </span>
            </div>
          </div>
          <div
            className={styles.btnContainer}
            style={{ padding: "0 8px 8px 8px" }}
          >
            <Button
              className={styles.cancelBtn}
              variant="outline"
              onClick={handleClose}
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </Button>
            <Button
              className={styles.createBtn}
              variant="default"
              onClick={() => finishOper(true)}
            >
              <span className={styles.createBtnTxt}>{"Confirm"}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </React.Fragment>
  );
}
