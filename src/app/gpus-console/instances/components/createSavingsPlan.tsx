"use client";

import styles from "./createSavingsPlan.module.css";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { reqCreateSavingPlans } from "@/api/gpu-instance/savingsPlans";
import { reqGetSavingPlanTemplates } from "@/api/gpu-instance/explore";
import { message } from "@/components/ui/standard/notify";
import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import { reqMyWallet } from "@/api/gpu-instance/billing";

export default function CreateSavingsPlan({
  instanceInfo,
  finishForm,
}: {
  instanceInfo: any;
  finishForm: any;
}) {
  const [demandItems, setDemandItems] = useState<any>([]);
  const [templateItem, setTemplateItem] = useState("");
  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState<any>({});
  const [rechangeInfo, setRechangeInfo] = useState<{
    balance: any;
    price: any;
    hours: any;
  }>({
    balance: 0,
    price: 0,
    hours: 0,
  });
  useEffect(() => {
    let ignore = false;

    reqGetSavingPlanTemplates({ productId: instanceInfo.productId }).then(
      (res: any) => {
        if (ignore) return;
        const demandItems = [...(res?.data || [])];
        setDemandItems(demandItems);
        if (demandItems.length) {
          setTemplateItem(demandItems[0].id);
        }
      },
    );
    reqUserInfo({})
      .then((res: any) => {
        if (ignore) return;
        setUserInfo(res || {});
      })
      .catch(() => {
        if (ignore) return;
        setUserInfo({});
      });
    reqMyWallet({})
      .then((response: any) => {
        if (ignore) return;
        setRechangeInfo({
          balance: Number(response.balance) / 100,
          price: Number(response.price) / 100,
          hours: response.hours,
        });
      })
      .catch(() => {
        if (ignore) return;
        setRechangeInfo({ balance: "", price: "", hours: "" });
      });

    return () => {
      ignore = true;
    };
  }, [instanceInfo.productId]);
  function createSavingsPlan() {
    reqCreateSavingPlans({
      instanceId: instanceInfo.id,
      templateId: templateItem,
    }).then((res: any) => {
      message.success("success");
      finishForm();
    });
  }
  function getChargeSum() {
    const selectedItem = demandItems.find(
      (item: any) => item.id === templateItem,
    );
    if (selectedItem) {
      const curSum =
        Math.round(
          (Number(selectedItem?.price) *
            Number(selectedItem?.days) *
            Number(instanceInfo.gpuNum)) /
            1000,
        ) / 100;
      return curSum;
    } else {
      return 0;
    }
  }
  function renderSavingsPlanValue(selected: any) {
    const selectedItem = demandItems.find((item: any) => item.id === selected);
    const instancePrice = Number(instanceInfo.instancePrice || 0);
    const instanceSum =
      Math.round(
        (instancePrice *
          Number(selectedItem?.days) *
          Number(instanceInfo.gpuNum) *
          24) /
          1000,
      ) / 100;
    const curPrice =
      Math.round(
        (Number(selectedItem?.price) * Number(instanceInfo.gpuNum)) / 1000 / 24,
      ) / 100;
    const curSum =
      Math.round(
        (Number(selectedItem?.price) *
          Number(selectedItem?.days) *
          Number(instanceInfo.gpuNum)) /
          1000,
      ) / 100;
    return (
      <div className={styles.savingPlanValue}>
        <span className={styles.savingPlanName}>
          {selectedItem?.name + " Savings Plan- $" + curSum}
        </span>
        <span className={styles.savingPlanPriceWrap}>
          <span className={styles.savingPlanSaveBadge}>
            <span className={styles.savingPlanSaveText}>
              Save ${Math.round((instanceSum - curSum) * 100) / 100}
            </span>
          </span>
          <span className={styles.savingPlanHourlyPrice}>${curPrice}/hr</span>
        </span>
      </div>
    );
  }
  return (
    <div className={styles.subContainer}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>New Savings Plan</h1>
        <div className={styles.content}>
          {step === 0 ? (
            <Select
              value={templateItem}
              onValueChange={(value) => {
                setTemplateItem(value);
              }}
            >
              <SelectTrigger className={styles.selectTrigger}>
                {renderSavingsPlanValue(templateItem)}
              </SelectTrigger>
              <SelectContent>
                {demandItems && demandItems.length
                  ? demandItems.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))
                  : null}
              </SelectContent>
            </Select>
          ) : (
            ""
          )}
          <div className={styles.summaryCard}>
            <span className={styles.summaryContent}>
              <div className={styles.summaryTitle}>
                {instanceInfo.productName} x {instanceInfo.gpuNum}
              </div>
              <div className={styles.summaryDescription}>
                {
                  (
                    demandItems.find(
                      (item: any) => item.id === templateItem,
                    ) || { name: "" }
                  ).name
                }{" "}
                Savings Plan
              </div>
              <span className={styles.summaryAmount}>${getChargeSum()}</span>
            </span>
          </div>
          {step === 0 ? (
            <div className={styles.learnMoreRow}>
              <span
                // onClick={() =>
                //   window.open("https://docs.infrai.com/billing/billing-methods")
                // }
                className={styles.learnMoreLink}
              >
                What are savings plans?
              </span>
            </div>
          ) : (
            ""
          )}
          {step === 1 ? (
            <>
              <div className={styles.chargeNotice}>
                Your account will instantly be charged ${getChargeSum()} and the
                Savings Plan will be allocated to this instance
              </div>
              {Number(userInfo?.voucherBalance || 0) / 100 +
                rechangeInfo.balance <
              getChargeSum() ? (
                <div className={styles.balanceWarning}>
                  <span className={styles.balanceWarningText}>
                    The cost of this Savings Plan is greater than your current
                    balance
                  </span>
                </div>
              ) : (
                ""
              )}
              <div className={styles.chargeButtonRow}>
                {step === 1 &&
                Number(userInfo?.voucherBalance || 0) / 100 +
                  rechangeInfo.balance <
                  getChargeSum() ? (
                  <Button
                    className={styles.disabledChargeButton}
                    variant="default"
                  >
                    <span className={styles.disabledChargeText}>
                      Charge ${getChargeSum()}
                    </span>
                  </Button>
                ) : (
                  ""
                )}
                {step === 1 &&
                Number(userInfo?.voucherBalance || 0) / 100 +
                  rechangeInfo.balance >
                  getChargeSum() ? (
                  <Button
                    onClick={createSavingsPlan}
                    className={styles.primaryChargeButton}
                    variant="default"
                  >
                    <span className={styles.primaryChargeText}>
                      Charge ${getChargeSum()}
                    </span>
                  </Button>
                ) : (
                  ""
                )}
              </div>
            </>
          ) : (
            ""
          )}

          <div className={styles.footerActions}>
            {step === 0 ? (
              <Button
                onClick={() => setStep(1)}
                className={`${styles.footerButton} ${styles.nextButton}`}
                variant="default"
              >
                <span className={styles.nextButtonText}>Next</span>
              </Button>
            ) : (
              ""
            )}
            {step === 1 ? (
              <Button
                onClick={() => setStep(0)}
                className={`${styles.footerButton} ${styles.backButton}`}
              >
                <span className={styles.backButtonText}>Back</span>
              </Button>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
