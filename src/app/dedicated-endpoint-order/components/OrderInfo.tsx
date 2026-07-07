"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NOVITA_URL } from "@/constants/urls";
import localforage from "localforage";
import styles from "./OrderInfo.module.scss";
import { enterpriseProductInfo, payEnterprise } from "@/api/enterprise";
import { Separator } from "@/components/ui/separator";
import CircleCheckIcon from "@/lib/icons/CircleCheck";
import { message } from "@/components/ui/standard/notify";
import SelectBillingMethod, { BillingMethodEnum } from "./SelectBillingMethod";
import ErrorNotice from "@/lib/icons/ErrorNotice";
import { Button } from "@/components/ui/button";
import Big from "big.js";

export default function OrderInfo() {
  const searchParam = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [productInfo, setProductInfo] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<{
    type: BillingMethodEnum;
    data: any;
  }>({
    type: BillingMethodEnum.CARD,
    data: null,
  });
  const [errorText, setErrorText] = useState("");

  const nowProduct = useMemo(() => {
    if (!data) return null;
    const item = productInfo.find((item: any) => item.name === data.plan_name);
    return {
      ...data,
      ...item,
    };
  }, [productInfo, data]);

  const payEnterprisePlan = useCallback(() => {
    setLoading(true);
    payEnterprise({
      billingMethod: method.type,
      paymentMethodId: method.data?.paymentMethodId,
      planId: data?.plan_id,
      count: data?.count,
    })
      .then(() => {
        message.success("Payment success");
        router.push(NOVITA_URL.MODEL_API_CONSOLE_IMAGE_DE);
      })
      .catch((err) => {
        setErrorText(err?.errInfo || err?.message || err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [data, router, method]);

  const handleSelectBillingMethod = useCallback(
    (type: BillingMethodEnum, data: any) => {
      setMethod({ type, data });
    },
    [],
  );

  useEffect(() => {
    const oid = searchParam.get("oid");
    if (!oid) {
      router.push("/pricing");
    } else {
      localforage.getItem(oid).then((res: any) => {
        setData(res);
      });
    }
  }, [router, searchParam]);

  useEffect(() => {
    enterpriseProductInfo().then((res) => {
      if (Array.isArray(res.productList)) {
        setProductInfo(res.productList);
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className="flex flex-col md:flex-row w-full gap-[30px]">
        <div className={styles.included_info}>
          <div className={styles.included}>included</div>
          <div className={styles.list_func}>
            {Array.isArray(nowProduct?.func_list) &&
              nowProduct.func_list.map((func: string) => (
                <div className={styles.list_item} key={func}>
                  <div className={styles.icon}>
                    <CircleCheckIcon />
                  </div>
                  <div className={styles.text}>{func}</div>
                </div>
              ))}
          </div>
        </div>
        <div className={styles.payment_info}>
          <div className={styles.plan_name}>{nowProduct?.plan_name}</div>
          <div>
            <div className="flex justify-between items-center">
              <div className={styles.label}>price</div>
              <div className={styles.price_content}>
                {nowProduct?.discount_price &&
                  nowProduct?.discount_price !== nowProduct?.price && (
                    <span className="line-through text-sm text-common-dark-3 mr-2">
                      ${Big(nowProduct?.price || 0).toFixed(2)}
                    </span>
                  )}
                <span>
                  $
                  {Big(
                    nowProduct?.discount_price || nowProduct?.price || 0,
                  ).toFixed(2)}
                </span>
                <span>/month</span>
              </div>
            </div>
            <Separator className="mt-4" />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <div className={styles.label}>quantities</div>
              <div className={styles.quantity_content}>
                <span>{nowProduct?.count} </span>
                <span>Plans</span>
              </div>
            </div>
            <Separator className="mt-4" />
          </div>
          <div>
            <div className={styles.label}>Billing Methods</div>
            <div className="mt-4 mb-2">
              <SelectBillingMethod onSelect={handleSelectBillingMethod} />
            </div>
            <div className="text-black text-[12px] mb-4">
              {`Important: Once you select the billing method for your current
                  plan, all previous plans will automatically switch to the same
                  billing method.`}
            </div>
            {errorText && (
              <div className={styles.error_text}>
                <span>
                  <ErrorNotice />
                </span>
                <span className={styles.content}>{errorText}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-[28px] mb-2">
        <div className="text-right text-[12px] text-common-dark-3">
          By subscribing, you authorize us to automatically deduct the
          subscription cost each month to renew your service until you cancel.
        </div>
      </div>
      <Separator />
      <div className="flex py-8">
        <div className="flex-grow"></div>
        <div className="flex items-center gap-5">
          <div className="">Total</div>
          <div className="font-h4">
            $
            {Big(nowProduct?.discount_price || nowProduct?.price || 0)
              .mul(nowProduct?.count || 1)
              .toFixed(2)}
          </div>
          <Button
            variant="default"
            disabled={loading}
            onClick={payEnterprisePlan}
            className="w-[200px]"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
