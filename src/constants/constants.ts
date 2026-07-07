export const LANG = {
  EN: "en",
};

export const Novita_Product_ID = "prod_OmMS4hG51CSWlT";
export const Novita_Product_Name = "Novita AI API";

export const DEBUG_MODE = "__DEV_DEBUG__";
export const TurnstileSiteKey = "0x4AAAAAAAaG28VfN_OxkED8";

export const MAX_IMAGE_SIZE = (30 * 1024 * 1024) / 8;
export const MAX_VIDEO_SIZE = (100 * 1024 * 1024) / 8;

export const PERMISSION = {
  RESOURCE_GROUP: {
    account: "account",
    billing: "billing",
    gpu_setting: "gpu_setting",
    image: "image",
    instance: "instance",
    jobs: "jobs",
    key_management: "key_management",
    main_console: "main_console",
    model_api: "model_api",
    serverless: "serverless",
    storage: "storage",
    team: "team",
    template: "template",
    vpc: "vpc",
    playground: "playground",
    quota: "quota",
  },
  RESOURCE: {
    real_name_authentication: "real_name_authentication",
    balance: "balance",
    vouchers: "vouchers",
    transactions: "transactions",
    details: "details",
    dedicated_endpoints_info: "dedicated_endpoints_info",
    warning: "warning",
    payment_method: "payment_method",
    recharge: "recharge",
    auto_recharge: "auto_recharge",
    ssh_public_keys: "ssh_public_keys",
    container_registry_auth: "container_registry_auth",
    single_numa: "single_numa",
    image_push: "image_push",
    image: "image",
    image_prewarm: "image_prewarm",
    instance: "instance",
    jobs: "jobs",
    key_management: "key_management",
    my_service: "my_service",
    billing: "billing",
    cost: "cost",
    affiliate: "affiliate",
    usage: "usage",
    settings: "settings",
    dedicated_endpoints: "dedicated_endpoints",
    upload_model: "upload_model",
    dedicated_endpoints_subscribe: "dedicated_endpoints_subscribe",
    serverless: "serverless",
    storage: "storage",
    invite: "invite",
    audit_log: "audit_log",
    member: "member",
    info: "info",
    template: "template",
    vpc: "vpc",
    overview: "overview",
    playground: "playground",
    llm_metrics: "llm_metrics",
    member_basic_info: "member_basic_info",
    apply_adjust_quota: "apply_adjust_quota",
    llm_dedicated_endpoints: "llm_dedicated_endpoints",
    budget: "budget",
    resource_pack: "resource_pack",
  },
  ACTION: {
    all: "*",
    read: "read",
    create: "create",
    update: "update",
    delete: "delete",
  },
};

export const PERMISSION_ERR_CODE = ["FORBIDDEN"];

export enum API_SOURCE {
  PLAYGROUND = "playground-novita",
  DEMO = "demo-novita",
}

export enum ENTERPRISE_PLAYGROUND_CONFIG {
  USE_ENTERPRISE = "USE_ENTERPRISE",
  NOT_USE_ENTERPRISE = "NOT_USE_ENTERPRISE",
}

export const getApiSource = (rootPage: string) => {
  if (rootPage === "playground") {
    return API_SOURCE.PLAYGROUND;
  }
  if (rootPage === "product") {
    return API_SOURCE.DEMO;
  }
  return "";
};

export const Local_Collect_Store = "local_collect_store";

export const MODEL_LIST_PAGE_SIZE = 100;

// not show：Image、Image Push、Real Name Authentication
export const HIDE_RESOURCE_EN = [
  PERMISSION.RESOURCE.image,
  PERMISSION.RESOURCE.image_push,
  PERMISSION.RESOURCE.real_name_authentication,
];

export const AFFILIATE_INVITE_URL_KEY = "invited_code";

export const TOP_UP_REDIRECT_URL = "top_up_redirect_url";
