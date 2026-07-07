"use client";

import { AffiliateInfoResponse, getAffiliateInfo } from "@/api/user";
import { createContext, useEffect, useState } from "react";
import styles from "./page.module.scss";
import Big from "big.js";
import PermissionWrapper from "../components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";

const defaultAffiliate = {
  referralLink: "",
  invites: 0,
  clicks: 0,
  balance: 0,
  password: "",
};

export const Context = createContext<{
  affiliate: AffiliateInfoResponse;
  loading: boolean;
}>({
  affiliate: defaultAffiliate,
  loading: false,
});

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [affiliate, setAffiliate] = useState(defaultAffiliate);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAffiliateInfo()
      .then((res) => {
        setAffiliate({
          ...res,
          balance: new Big(res.balance).times(0.0001).toNumber(),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.main_console}
      resource={PERMISSION.RESOURCE.affiliate}
      action={PERMISSION.ACTION.all}
    >
      <Context.Provider
        value={{
          affiliate,
          loading,
        }}
      >
        <div className={styles.client_box}>{children}</div>
      </Context.Provider>
    </PermissionWrapper>
  );
}
