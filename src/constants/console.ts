import reduce from "lodash/reduce";
import { NOVITA_URL, DOCS_URL } from "@/constants/urls";
export const CONSOLE_PAGE_INFO = {
  serverless_console: {
    displayName: "Serverless Console",
    paths: [NOVITA_URL.GPU_CONSOLE_SERVERLESS],
  },
  gpu_console: {
    displayName: "GPU Instance Console",
    paths: [
      NOVITA_URL.GPU_CONSOLE_EXPLORE,
      NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE,
      NOVITA_URL.GPU_CONSOLE_INSTANCES,
      NOVITA_URL.GPU_CONSOLE_STORAGE,
      NOVITA_URL.GPU_CONSOLE_TEMPLATES,
      NOVITA_URL.GPU_CONSOLE_BILLING,
      NOVITA_URL.GPU_CONSOLE_SETTINGS,
    ],
  },
  model_api_console: {
    displayName: "Model API Console",
    paths: [
      NOVITA_URL.MODEL_API_CONSOLE,
      NOVITA_URL.MODEL_API_CONSOLE_IMAGE_DE,
      NOVITA_URL.MODEL_API_CONSOLE_MODEL,
      NOVITA_URL.MODEL_API_CONSOLE_SETTINGS,
      NOVITA_URL.MODEL_API_CONSOLE_LOGS,
    ],
  },
  settings: {
    displayName: "Settings",
    paths: [NOVITA_URL.SETTINGS],
  },
  billing: {
    displayName: "Billing",
    paths: [
      NOVITA_URL.BILLING_OVERVIEW,
      NOVITA_URL.BILLING_OVERVIEW_COMPATIBLE,
      NOVITA_URL.BILLING_PAYMENT,
      NOVITA_URL.BILLING_TRANSACTIONS,
      NOVITA_URL.BILLING_DETAILS,
      NOVITA_URL.BILLING_BALANCE_WARNING,
      NOVITA_URL.BILLING_BUDGETS,
      NOVITA_URL.BILLING_CODING_PLAN,
    ],
  },
  sandbox_console: {
    displayName: "Sandbox Console",
    paths: [
      NOVITA_URL.SANDBOX_CONSOLE,
      NOVITA_URL.SANDBOX_CONSOLE_VIEW,
      NOVITA_URL.SANDBOX_CONSOLE_TEMPLATE,
      NOVITA_URL.SANDBOX_CONSOLE_USAGE,
    ],
  },
};
export const CONSOLE_PAGE_PATH_MAP = reduce(
  CONSOLE_PAGE_INFO,
  (obj, value, key) => {
    for (const path of value.paths) {
      obj[path] = key;
    }
    return obj;
  },
  {} as Record<string, string>,
);
export const LLM_MODEL_FEATURE_MAP: Record<string, string> = {
  "function-calling": "Function Calling",
  "structured-outputs": "Structured Outputs",
};
export const DOC_LIST = [
  {
    displayName: "Get started",
    path: DOCS_URL.HOME,
  },
  {
    displayName: "Model API",
    path: DOCS_URL.MODEL_API,
  },
  {
    displayName: "Serverless",
    path: DOCS_URL.SERVERLESS,
  },
  {
    displayName: "GPU Instance",
    path: DOCS_URL.GPU_INSTANCE,
  },
];
