"use client";
import { useMemo } from "react";
import { NavMenuItem } from "@/types/header";
import { useAppSelector } from "@/store";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { useI18n } from "@/i18n/provider";
const { HEADER_LINK_IDs } = CLICK_BTN_IDs;
const createIndexMenuItems = (): NavMenuItem[] => [
  {
    key: "model_library",
    path: NOVITA_URL.MODEL_LIBRARY_INDEX,
    elmId: HEADER_LINK_IDs.MODEL_LIBRARY,
    title: "Model APIs",
  },
  {
    key: "sandbox",
    path: NOVITA_URL.SANDBOX_INDEX,
    elmId: HEADER_LINK_IDs.SANDBOX,
    title: "Agent Sandbox",
    id: "sandbox",
  },
  {
    key: "gpus",
    elmId: HEADER_LINK_IDs.GPUS_MAINMENU,
    title: "GPUs",
    dropdown: [
      {
        key: "gpu_instance",
        elmId: HEADER_LINK_IDs.GPU_INSTANCE,
        path: NOVITA_URL.GPU_INDEX,
        title: "GPU Instance",
      },
      {
        key: "gpu_baremetal",
        elmId: HEADER_LINK_IDs.GPU_BAREMETAL,
        path: NOVITA_URL.GPU_BAREMETAL_INDEX,
        title: "GPU Bare Metal",
      },
    ],
  },
];
const createPricingMenuItem = (): NavMenuItem => ({
  key: "pricing",
  title: "Pricing",
  path: NOVITA_URL.PRICING,
  elmId: HEADER_LINK_IDs.PRICING,
});
const createConsoleMenuItems = (): NavMenuItem[] => [
  {
    key: "model_api_console",
    title: "My Models",
    path: NOVITA_URL.MODEL_API_CONSOLE,
    elmId: HEADER_LINK_IDs.CONSOLE_MODELAPI,
  },
  {
    key: "agent_sandbox_console",
    path: NOVITA_URL.SANDBOX_CONSOLE,
    elmId: HEADER_LINK_IDs.CONSOLE_AGENT_SANDBOX,
    title: "Agent Sandbox",
  },
  {
    key: "gpu_console",
    title: "GPUs",
    path: NOVITA_URL.GPU_CONSOLE_EXPLORE,
    elmId: HEADER_LINK_IDs.CONSOLE_INSTANCE,
  },
];
const createBillingMenuItem = (): NavMenuItem => ({
  key: "billing",
  title: "Billing",
  path: NOVITA_URL.BILLING_OVERVIEW,
  elmId: HEADER_LINK_IDs.BILLING,
});
const createOthersItems = (): NavMenuItem[] => [
  {
    key: "docs",
    title: "Docs",
    path: DOCS_URL.HOME,
    elmId: HEADER_LINK_IDs.API,
    linkTarget: "_blank",
  },
  {
    key: "blog",
    title: "Blog",
    path: "https://blogs.novita.ai",
    elmId: HEADER_LINK_IDs.BLOG,
    linkTarget: "_blank",
  },
];
const createConsoleMenuItem = (): NavMenuItem => ({
  key: "console",
  title: "Console",
  path: NOVITA_URL.CONSOLE,
  elmId: HEADER_LINK_IDs.CONSOLE,
});
export const useTopNavigationItems = (page?: "playground" | "console") => {
  const uuid = useAppSelector((state) => state.user.uuid);
  const { locale } = useI18n();
  const navMenuItems = useMemo(() => {
    void locale;
    const finalNavItems: NavMenuItem[] = [];
    if (page !== "console") {
      finalNavItems.push(...createIndexMenuItems());
      finalNavItems.push(createPricingMenuItem());
    }
    if (page === "console") {
      finalNavItems.push(...createConsoleMenuItems());
      finalNavItems.push(createBillingMenuItem());
    }
    finalNavItems.push(...createOthersItems());
    if (page !== "console" && uuid) {
      finalNavItems.push(createConsoleMenuItem());
    }
    return finalNavItems;
  }, [locale, page, uuid]);
  return navMenuItems;
};
