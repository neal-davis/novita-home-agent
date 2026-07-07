"use client";

import { useMemo, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import styles from "./SettingsTabs.module.scss";

interface SettingsTabsProps {
  accountContent: React.ReactNode;
  teamContent: React.ReactNode;
  keyManagementContent: React.ReactNode;
  auditLogsContent: React.ReactNode;
}

const baseTabConfig = [
  { value: "account", label: "Account", path: NOVITA_URL.SETTINGS_ACCOUNT },
  { value: "team", label: "Team", path: NOVITA_URL.SETTINGS_TEAM },
];

const keyManagementTab = {
  value: "key-management",
  label: "Key Management",
  path: NOVITA_URL.SETTINGS_KEYS,
};
const auditLogsTab = {
  value: "audit-logs",
  label: "Audit Logs",
  path: NOVITA_URL.SETTINGS_AUDIT,
};

const getActiveTabFromPath = (
  tabConfig: typeof baseTabConfig,
  businessPathname: string,
): string => {
  const currentTab = tabConfig.find((tab) => businessPathname === tab.path);
  return currentTab?.value || "account";
};

export default function SettingsTabs({
  accountContent,
  teamContent,
  keyManagementContent,
  auditLogsContent,
}: SettingsTabsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const businessPathname = getPathnameWithoutLocale(pathname);

  const keyPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.key_management,
    resource: PERMISSION.RESOURCE.key_management,
    action: PERMISSION.ACTION.read,
  });

  const auditLogsPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.team,
    resource: PERMISSION.RESOURCE.audit_log,
    action: PERMISSION.ACTION.read,
  });

  // Build tab configuration based on permissions
  const tabConfig = useMemo(() => {
    const tabs = [...baseTabConfig];
    if (keyPermission) {
      tabs.push(keyManagementTab);
    }
    if (auditLogsPermission) {
      tabs.push(auditLogsTab);
    }
    return tabs;
  }, [keyPermission, auditLogsPermission]);

  const activeTab = getActiveTabFromPath(tabConfig, businessPathname);

  useEffect(() => {
    const currentTab = tabConfig.find((tab) => businessPathname === tab.path);
    if (
      !currentTab &&
      (businessPathname === NOVITA_URL.SETTINGS_KEYS ||
        businessPathname === NOVITA_URL.SETTINGS_AUDIT)
    ) {
      router.replace(getLocalizedPath(NOVITA_URL.SETTINGS_ACCOUNT, locale));
    }
  }, [businessPathname, locale, tabConfig, router]);

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

      <TabsContent value="account" className="m-4 pt-0">
        {accountContent}
      </TabsContent>

      <TabsContent
        value="team"
        className="p-4 bg-[var(--white)] max-w-full overflow-hidden"
      >
        <div
          className="bg-white rounded-[6px] p-4"
          style={{
            border: "1px solid var(--gray-2)",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          }}
        >
          {teamContent}
        </div>
      </TabsContent>

      {keyPermission && (
        <TabsContent value="key-management" className="m-4 pt-0">
          {keyManagementContent}
        </TabsContent>
      )}

      {auditLogsPermission && (
        <TabsContent value="audit-logs" className="m-4 pt-0">
          {auditLogsContent}
        </TabsContent>
      )}
    </Tabs>
  );
}
