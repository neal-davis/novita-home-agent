import { useState, useEffect } from "react";
import styles from "../page.module.scss";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchBillingInfo } from "@/store/slice/billingSlice";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { useI18nSubscription } from "@/i18n/provider";

export default function CategoryTabs({ onChange }: { onChange: any }) {
  // Subscribe so locale switches re-render and re-evaluate the `__t(...)`
  // calls below. Without this the `label` strings would freeze at module init.
  useI18nSubscription();

  // Built per-render so each `label` literal is re-evaluated on locale change.
  const tabDatas = [
    {
      value: "OnDemand",
      label: "Usage-based Billing",
      id: CLICK_BTN_IDs.BILLING.BILLING_DETAIL_USAGE_BASED_TAB,
    },
    {
      value: "Monthly",
      label: "Fixed-term Billing",
      id: CLICK_BTN_IDs.BILLING.BILLING_DETAIL_FIXED_TERM_TAB,
    },
  ];
  const tabDatasTeam = [
    ...tabDatas,
    {
      value: "MultiDimension",
      label: "Aggregated Billing",
      id: CLICK_BTN_IDs.BILLING.BILLING_DETAIL_AGGREGATED_TAB,
    },
  ];
  const tabDatasEnterprise = {
    value: "Enterprise",
    label: "Enterprise Billing",
    id: CLICK_BTN_IDs.BILLING.BILLING_DETAIL_ENTERPRISE_TAB,
  };

  const billingInfo = useAppSelector((state) => state.billing.billingInfo);
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState("OnDemand");

  const tabs = billingInfo?.isEnterprise
    ? [...tabDatasTeam, tabDatasEnterprise]
    : tabDatasTeam;

  useEffect(() => {
    if (!billingInfo) {
      dispatch(fetchBillingInfo() as any);
    }
  }, [dispatch, billingInfo]);

  return (
    <div className={styles.titleTab}>
      {tabs.map((item, index) => (
        <div
          onClick={() => {
            setActiveTab(item.value);
            onChange(item.value);
          }}
          id={item.id}
          className={`${styles.tabItem} 
              ${activeTab === item.value ? styles.active : styles.notActive}
              `}
          key={index}
        >
          <span
            className={
              activeTab === item.value ? styles.tabTitleActive : styles.tabTitle
            }
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
