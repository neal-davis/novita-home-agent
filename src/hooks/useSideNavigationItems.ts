"use client";

import { useMemo } from "react";
import { usePermission } from "@/lib/hooks/usePermission";
import { NavMenuItem, ConsoleProduct } from "@/types/header";
import { PERMISSION } from "@/constants/constants";
import { NOVITA_URL, DOCS_URL } from "@/constants/urls";
import { isCodingPlanCampaignActive } from "@/lib/utils/codingPlanCampaign";
import { useI18n } from "@/i18n/provider";

const createMainNavItems = (): NavMenuItem[] => [
  {
    key: "home",
    path: NOVITA_URL.CONSOLE,
    title: "Home",
  },
  {
    key: "models",
    path: NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY,
    title: "Model APIs",
  },
  {
    key: "sandbox",
    path: NOVITA_URL.SANDBOX_CONSOLE,
    title: "Agent Sandbox",
  },
  {
    key: "gpus",
    path: NOVITA_URL.GPU_CONSOLE_APPLICATION,
    title: "GPUs",
  },
  {
    key: "docs",
    path: DOCS_URL.HOME,
    title: "Docs",
    linkTarget: "_blank",
  },
  {
    key: "quick-access",
    title: "QUICK ACCESS",
    isCategory: true,
  },
  {
    key: "pricing",
    path: NOVITA_URL.CONSOLE_PRICING,
    title: "Pricing",
  },
  {
    key: "billing",
    path: NOVITA_URL.BILLING_OVERVIEW,
    title: "Billing",
  },
  {
    key: "quota-limits",
    path: NOVITA_URL.QUOTA_LIMITS,
    altPaths: [
      NOVITA_URL.QUOTA_LIMITS_LLM,
      NOVITA_URL.QUOTA_LIMITS_IMAGE,
      NOVITA_URL.QUOTA_LIMITS_SANDBOX,
    ],
    title: "Quotas & Limits",
  },
  {
    key: "settings",
    path: NOVITA_URL.SETTINGS,
    altPaths: [
      NOVITA_URL.SETTINGS_TEAM,
      NOVITA_URL.SETTINGS_KEYS,
      NOVITA_URL.SETTINGS_AUDIT,
    ],
    title: "Account Settings",
  },
];

const createModelsNavItems = (): NavMenuItem[] => [
  {
    key: "model-library",
    path: NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY,
    altPaths: [NOVITA_URL.MODEL_API_CONSOLE],
    title: "Model Library",
  },
  {
    key: "llm-category",
    title: "LLM",
    isCategory: true,
  },
  {
    key: "llm-playground",
    path: NOVITA_URL.LLM_CONSOLE_PLAYGROUND,
    title: "LLM Playground",
  },
  {
    key: "llm-dedicated-endpoints",
    path: NOVITA_URL.MODEL_API_CONSOLE_LLM_DE,
    title: "Deployments",
  },
  {
    key: "llm-metrics",
    path: NOVITA_URL.MODEL_API_CONSOLE_LLM_METRICS,
    title: "Metrics",
  },
  {
    key: "metrics-usage",
    path: NOVITA_URL.MODEL_API_CONSOLE_METRICS_USAGE,
    title: "Usage",
  },
  {
    key: "logs",
    path: NOVITA_URL.MODEL_API_CONSOLE_LOGS,
    title: "Logs",
  },
  {
    key: "multimodal-category",
    title: "MULTIMODAL",
    isCategory: true,
  },
  {
    key: "multimodal-playground",
    path: NOVITA_URL.MODEL_API_CONSOLE_IMAGE_PLAYGROUND,
    title: "Multimodal Playground",
  },
  {
    key: "image-dedicated-endpoints",
    path: NOVITA_URL.MODEL_API_CONSOLE_IMAGE_DE,
    title: "Dedicated Endpoints",
  },
  {
    key: "model-management",
    path: NOVITA_URL.MODEL_API_CONSOLE_MODEL,
    title: "Model Management",
  },
  {
    key: "settings",
    path: NOVITA_URL.MODEL_API_CONSOLE_SETTINGS,
    title: "Settings",
  },
  {
    key: "quick-access",
    title: "QUICK ACCESS",
    isCategory: true,
  },
  {
    key: "billing",
    path: NOVITA_URL.BILLING_OVERVIEW,
    title: "Billing",
  },
  {
    key: "pricing",
    path: NOVITA_URL.CONSOLE_PRICING,
    title: "Pricing",
  },
  {
    key: "quota-limits",
    path: NOVITA_URL.QUOTA_LIMITS,
    altPaths: [NOVITA_URL.QUOTA_LIMITS_LLM, NOVITA_URL.QUOTA_LIMITS_IMAGE],
    title: "Quotas & Limits",
  },
  {
    key: "docs",
    path: DOCS_URL.MODEL_API,
    title: "Docs",
    linkTarget: "_blank",
  },
];

const createGpusNavItems = (): NavMenuItem[] => [
  {
    key: "application",
    path: NOVITA_URL.GPU_CONSOLE_APPLICATION,
    title: "Application",
  },
  {
    key: "templates-library",
    path: NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY,
    title: "Templates Library",
  },
  {
    key: "instance",
    title: "Instances",
    isCategory: true,
  },
  {
    key: "explore",
    path: NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE,
    altPaths: [NOVITA_URL.GPU_CONSOLE_EXPLORE],
    title: "Deploy Instance",
  },
  {
    key: "instances",
    path: NOVITA_URL.GPU_CONSOLE_INSTANCES,
    title: "My Instances",
  },
  {
    key: "serverless-title",
    title: "Serverless",
    isCategory: true,
  },
  {
    key: "serverless-deploy",
    path: NOVITA_URL.GPU_CONSOLE_SERVERLESS_DEPLOY,
    title: "Deploy Serverless",
  },
  {
    key: "serverless",
    path: NOVITA_URL.GPU_CONSOLE_SERVERLESS,
    title: "My Endpoints",
  },
  {
    key: "other",
    title: "Other",
    isCategory: true,
  },
  {
    key: "image-prewarm",
    path: NOVITA_URL.GPU_CONSOLE_IMAGE_PREWARM,
    title: "Image Prewarm",
  },
  {
    key: "volume",
    path: NOVITA_URL.GPU_CONSOLE_STORAGE,
    title: "Network Volume",
  },
  // {
  //   key: "templates",
  //   path: NOVITA_URL.GPU_CONSOLE_TEMPLATES,
  //   title: "Templates",
  // },
  {
    key: "jobs",
    path: NOVITA_URL.GPU_CONSOLE_JOBS,
    title: "Jobs",
  },
  {
    key: "settings",
    path: NOVITA_URL.GPU_CONSOLE_SETTINGS,
    title: "Settings",
  },
  {
    key: "quick-access",
    title: "QUICK ACCESS",
    isCategory: true,
  },
  {
    key: "billing",
    path: NOVITA_URL.BILLING_OVERVIEW,
    title: "Billing",
  },
  {
    key: "pricing",
    path: `${NOVITA_URL.CONSOLE_PRICING}?gpu=1`,
    title: "Pricing",
  },
  {
    key: "docs",
    path: DOCS_URL.GPUS,
    title: "Docs",
    linkTarget: "_blank",
  },
];

const createSandboxNavItems = (): NavMenuItem[] => [
  {
    key: "sandbox",
    path: NOVITA_URL.SANDBOX_CONSOLE_VIEW,
    altPaths: [NOVITA_URL.SANDBOX_CONSOLE],
    title: "Sandbox",
  },
  {
    key: "template",
    path: NOVITA_URL.SANDBOX_CONSOLE_TEMPLATE,
    title: "Template",
  },
  {
    key: "usage",
    path: NOVITA_URL.SANDBOX_CONSOLE_USAGE,
    title: "Usage",
  },
  {
    key: "quota-limits",
    path: NOVITA_URL.SANDBOX_CONSOLE_QUOTA_LIMITS,
    title: "Quotas & Limits",
  },
  {
    key: "quick-access",
    title: "QUICK ACCESS",
    isCategory: true,
  },
  {
    key: "billing",
    path: NOVITA_URL.BILLING_OVERVIEW,
    title: "Billing",
  },
  {
    key: "pricing",
    path: `${NOVITA_URL.CONSOLE_PRICING}?sandbox=1`,
    title: "Pricing",
  },
  {
    key: "docs",
    path: DOCS_URL.SANDBOX_INTRODUCTION,
    title: "Docs",
    linkTarget: "_blank",
  },
];

const createBillingNavItems = (): NavMenuItem[] => [
  {
    key: "back",
    path: "",
    title: "",
    isBack: true,
  },
  {
    key: "overview",
    path: NOVITA_URL.BILLING_OVERVIEW,
    title: "Billing Overview",
  },
  {
    key: "transactions",
    path: NOVITA_URL.BILLING_TRANSACTIONS,
    title: "Recharge Records",
  },
  {
    key: "details",
    path: NOVITA_URL.BILLING_DETAILS,
    title: "Billing Details",
  },
  {
    key: "coding-plan",
    path: NOVITA_URL.BILLING_CODING_PLAN,
    title: "Coding Plan",
  },
  {
    key: "balance-warning",
    path: NOVITA_URL.BILLING_BALANCE_WARNING,
    title: "Low Balance Alert",
  },
  {
    key: "budgets",
    path: NOVITA_URL.BILLING_BUDGETS,
    title: "Budgets",
  },
  {
    key: "docs",
    path: DOCS_URL.HOME,
    title: "Docs",
    linkTarget: "_blank",
  },
];

export const useSideNavigationItems = (product: ConsoleProduct) => {
  const { locale } = useI18n();
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

  const isCodingPlanActive = isCodingPlanCampaignActive();

  const sideNavItems = useMemo(() => {
    void locale;

    const billingNavItems = createBillingNavItems();

    switch (product) {
      case "main":
        return createMainNavItems();
      case "models":
        return createModelsNavItems();
      case "gpus":
        return createGpusNavItems();
      case "sandbox":
        return createSandboxNavItems();
      case "billing":
        return isCodingPlanActive
          ? billingNavItems
          : billingNavItems.filter((item) => item.key !== "coding-plan");
      default:
        return [];
    }
  }, [locale, product, isCodingPlanActive]);

  return sideNavItems;
};
