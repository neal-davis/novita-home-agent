"use client";

import Image from "next/image";
import {
  getRegistrationCampaign,
  isShowRegistrationCampaign,
} from "@/lib/utils/registrationCampaign";
import getCampaignConfig from "@/config/campaign";
import MDDocs from "@/components/ui/standard/md-docs";
import styles from "./index.module.scss";

type RootPage = "login" | "signup" | "reset" | "validate-email";

export function PageWithBg({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  rootPage: RootPage;
  searchParams?: Record<string, string>;
}) {
  const showRegistrationCampaign = isShowRegistrationCampaign(searchParams);
  const registrationCampaign = getRegistrationCampaign();
  const campaign = getCampaignConfig();

  const renderDefaultContent = () => (
    <>
      <h1
        className="text-[90px] leading-[80px] font-semibold"
        style={{
          letterSpacing: "-1.8px",
        }}
      >
        Novita
        <span className="text-primary">{" AI"}</span>
      </h1>
      <h2 className="text-[24px] font-semibold text-common-dark-1 mt-7 leading-[24px]">
        The AI-Native Cloud for Builders and Agents
      </h2>
      <p className="text-[20px] text-common-dark-2 mt-4 leading-[24px]">
        Run models, scale GPUs, and build AI agents, all on one platform.
      </p>
      <div className="mt-8 flex flex-col gap-[9px] items-start rounded-2xl border border-[var(--border-2)] bg-[var(--fill-5)] px-6 py-4 shadow-[0px_2px_8px_0px_var(--alpha-dark-5)]">
        <div className="flex items-center justify-center px-2 py-0.5 rounded-xl bg-[var(--orange-50)]">
          <p className="text-[12px] leading-[16px] text-[var(--text-warning)] whitespace-nowrap">
            LATEST UPDATES
          </p>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <p className="text-[20px] leading-[26px] font-medium text-[var(--text-1)]">
            Get $100 Sandbox Credits
          </p>
          <p className="text-[14px] leading-[20px] text-[var(--text-3)]">
            Sign up and start building instantly. Get $100 in Sandbox credits,
            valid for 90 days. No credit card required.
          </p>
        </div>
      </div>
    </>
  );

  const renderCampaignContent = () => {
    // Priority: registrationCampaign > loginSignupCampaignText
    if (registrationCampaign) {
      return (
        <div className={styles.campaign_wrap}>
          {registrationCampaign.logo && (
            <Image
              src={registrationCampaign.logo}
              alt="campaign"
              width={400}
              height={40}
            />
          )}
          {registrationCampaign.title && (
            <h5
              className={styles.campaign_title}
              dangerouslySetInnerHTML={{ __html: registrationCampaign.title }}
            ></h5>
          )}
          <div className={styles.campaign_description}>
            <MDDocs content={registrationCampaign.description} />
          </div>
        </div>
      );
    }

    if (campaign?.enabled && campaign?.loginSignupLabelText) {
      return (
        <div className={styles.campaign_wrap}>
          <h1
            className="text-[90px] leading-[80px] font-semibold mb-7"
            style={{
              letterSpacing: "-1.8px",
            }}
          >
            Novita
            <span className="text-primary">{" AI"}</span>
          </h1>
          {campaign.loginSignupTitle && (
            <h5
              className={styles.campaign_title}
              dangerouslySetInnerHTML={{ __html: campaign.loginSignupTitle }}
            ></h5>
          )}
          <div className={styles.campaign_description}>
            <MDDocs content={campaign.loginSignupDescription || ""} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-common-gray-3">
      <header className="items-center shrink-0 h-[80px] hidden sm:flex sm:pl-[40px]">
        <a href="/">
          <Image
            src="/logo/logo-150.svg"
            alt="logo"
            width={120}
            height={24}
            priority
          />
        </a>
      </header>
      <main className="flex-1 flex justify-center items-center">
        <div className="flex items-center gap-[70px] sm:translate-y-[-40px] translate-y-0">
          <div className="w-[426px] hidden lg:block">
            {showRegistrationCampaign ||
            (campaign?.enabled && campaign?.loginSignupLabelText)
              ? renderCampaignContent()
              : renderDefaultContent()}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
