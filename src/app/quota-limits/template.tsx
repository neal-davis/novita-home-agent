"use client";

import ConsoleHeaderWrapper from "@/app/components/header/ConsoleHeaderWrapper";
import QuotaLimitsTabs from "./components/QuotaLimitsTabs";
import LLMQuotaLimits from "./components/LLMQuotaLimits";
import ImageQuotaLimits from "./components/ImageQuotaLimits";
import SandboxQuotaLimits from "./components/SandboxQuotaLimits";
import styles from "./page.module.scss";

export default function Layout() {
  return (
    <ConsoleHeaderWrapper product="main">
      <div className={styles.template_container}>
        <QuotaLimitsTabs
          llmContent={<LLMQuotaLimits />}
          imageContent={<ImageQuotaLimits />}
          sandboxContent={<SandboxQuotaLimits />}
        />
      </div>
    </ConsoleHeaderWrapper>
  );
}
