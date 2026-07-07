"use client";

import styles from "./page.module.scss";
import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";
import Products from "./components/Products";
import FeaturesForYou from "./components/Features/FeaturesForYou";
import { ConsoleCampaignBanner } from "@/app/components/campaigns";
import AccountSummary from "./components/AccountSummary";
import Documents from "./components/Documents";
import Explore from "./components/Explore";
import CustomerInfo from "./components/CustomerInfo";
import { useI18n } from "@/i18n/provider";

export default function Page() {
  useI18n();

  return (
    <ConsoleHeaderWrapper className={styles.container} product="main">
      <div className="px-4 py-6 space-y-6">
        <Products />
        <FeaturesForYou />
        <ConsoleCampaignBanner />
        <AccountSummary />
        <Explore />
        <Documents />
        <CustomerInfo />
      </div>
    </ConsoleHeaderWrapper>
  );
}
