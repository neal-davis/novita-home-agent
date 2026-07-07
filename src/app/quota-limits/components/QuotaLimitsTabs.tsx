"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import styles from "./QuotaLimitsTabs.module.scss";

interface QuotaLimitsTabsProps {
  llmContent: React.ReactNode;
  imageContent: React.ReactNode;
  sandboxContent: React.ReactNode;
}

const tabConfig = [
  { value: "llm", label: "LLM", path: NOVITA_URL.QUOTA_LIMITS_LLM },
  { value: "image", label: "Image", path: NOVITA_URL.QUOTA_LIMITS_IMAGE },
  { value: "sandbox", label: "Sandbox", path: NOVITA_URL.QUOTA_LIMITS_SANDBOX },
];

const getActiveTabFromPath = (businessPathname: string): string => {
  const currentTab = tabConfig.find((tab) => businessPathname === tab.path);
  return currentTab?.value || "llm";
};

export default function QuotaLimitsTabs({
  llmContent,
  imageContent,
  sandboxContent,
}: QuotaLimitsTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const businessPathname = getPathnameWithoutLocale(pathname);

  const activeTab = getActiveTabFromPath(businessPathname);

  const handleTabChange = (value: string) => {
    const tab = tabConfig.find((t) => t.value === value);
    if (tab) {
      router.push(getLocalizedPath(tab.path, locale));
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList tabsStyle="line" align="left" className={styles.tabs_list}>
        {tabConfig.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="llm" className="m-4 pt-0">
        {llmContent}
      </TabsContent>

      <TabsContent value="image" className="m-4 pt-0">
        {imageContent}
      </TabsContent>

      <TabsContent value="sandbox" className="m-4 pt-0">
        {sandboxContent}
      </TabsContent>
    </Tabs>
  );
}
