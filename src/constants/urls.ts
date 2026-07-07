export const API_BASE_URL = "https://api.novita.ai/openai";
export const ANTHROPIC_BASE_URL = "https://api.novita.ai/anthropic";

/** 主站营销域名（文档等绝对链接拼接用，与 canonical 一致） */
export const NOVITA_SITE_ORIGIN = "https://novita.ai";

export const DOCS_URL = {
  HOME: "/docs/guides/introduction",
  QUICK_START: "/docs/guides/quickstart",
  FAQ: "/docs/guides/faq",
  PAYMENT_METHOD: "/docs/guides/payment-methods",
  AUTO_TOP_UP: "/docs/guides/auto-top-up",

  GPUS: "/docs/guides/gpus-overview",
  GPU_INSTANCE: "/docs/guides/gpu-instance-overview",
  CREATEINSTANCES: "/docs/guides/gpu-instance-quickstart-create-instances",
  CONNECTTOINSTANCE: "/docs/guides/gpu-instance-quickstart-connect-to-instance",

  GPU_INSTANCE_FEE: "/docs/guides/gpu-instance-pricing#2-storage-resources",
  GPU_CREATE_INSTANCES: "/docs/api-reference/gpu-instance-create-instance",
  IMAGE_PRE_WARM: "/docs/guides/gpu-image-prewarm",

  MODEL_API: "/docs/guides/model-apis-overview",
  SERVERLESS: "/docs/guides/serverless-gpus-overview",
  MODEL_API_INTRO: "/docs/api-reference/model-apis-introduction",
  LLM: "/docs/guides/llm-api",
  RERANKER: "/docs/api-reference/model-apis-llm-create-rerank",
  EMBEDDING: "/docs/api-reference/model-apis-llm-create-embeddings",
  LLM_RATE_LIMITS: "/docs/guides/llm-rate-limits",
  LLM_BATCH_INFERENCE: "/docs/guides/llm-batch-api",
  IMG2VIDEOMOTION:
    "/docs/model-api/reference/video-generator/img2video-motion.html", // end of service
  TXT2IMG: "/docs/api-reference/model-apis-text-to-image",
  IMG2IMG: "/docs/api-reference/model-apis-image-to-image",
  LCM_TXT2IMG:
    "/docs/model-api/reference/image-generator/text-to-image-with-lcm.html", // end of service
  LCM_IMG2IMG:
    "/docs/model-api/reference/image-generator/image-to-image-with-lcm.html", // end of service
  UPSCALE: "/docs/api-reference/model-apis-upscale",
  OUTPAINTING: "/docs/api-reference/model-apis-outpainting",
  INPAINTING: "/docs/api-reference/model-apis-inpainting",
  CLEANUP: "/docs/api-reference/model-apis-cleanup",
  REIMAGINE: "/docs/model-api/reference/image-generator/re-imagine.html", // end of service
  DOODLE: "/docs/model-api/reference/image-generator/doodle.html", // end of service
  MIX_POSE: "/docs/model-api/reference/image-generator/mix-pose.html", // end of service
  REMOVE_BACKGROUND: "/docs/api-reference/model-apis-remove-background",
  REPLACE_BACKGROUND: "/docs/api-reference/model-apis-replace-background",
  REPLACE_SKY: "/docs/model-api/reference/image-editor/replace-sky.html", // end of service
  REMOVE_TEXT: "/docs/api-reference/model-apis-remove-text",
  TILE: "/docs/model-api/reference/image-generator/create-tile.html", // end of service
  REPLACE_OBJECT: "/docs/model-api/reference/image-editor/replace-object.html", // end of service
  RESTORE_FACE: "/docs/model-api/reference/face-editor/restore-face.html", // end of service
  MERGE_FACE: "/docs/api-reference/model-apis-merge-face",
  MAKE_PHOTO: "/docs/model-api/reference/face-editor/make-photo.html", // end of service
  SDXL: "/docs/api-reference/model-apis-text-to-image#4-txt2img-request-with-sdxl-1-0",
  LORA: "/docs/api-reference/model-apis-text-to-image#2-txt2img-request-with-lora",
  TRAINING: "/docs/api-reference/model-apis-create-subject-training",
  HUNYUAN_VIDEO_FAST: "/docs/api-reference/model-apis-hunyuan-video-fast",
  WAN_T2V: "/docs/api-reference/model-apis-wan-t2v",
  WAN_I2V: "/docs/api-reference/model-apis-wan-i2v",
  WAN_2_6_T2V: "/docs/api-reference/model-apis-wan2.6-t2v",
  WAN_2_6_I2V: "/docs/api-reference/model-apis-wan2.6-i2v",
  WAN_2_6_V2V: "/docs/api-reference/model-apis-wan2.6-v2v",
  KLING_V1_6_T2V: "/docs/api-reference/model-apis-kling-v1.6-t2v",
  KLING_V1_6_I2V: "/docs/api-reference/model-apis-kling-v1.6-i2v",
  MINIMAX_VIDEO_01: "/docs/api-reference/model-apis-minimax-video-01",
  MINIMAX_HAILUO_02: "/docs/api-reference/model-apis-minimax-hailuo-02",
  KLING_V30_STD_T2V: "/docs/api-reference/model-apis-kling-v3.0-std-t2v",
  KLING_V30_STD_I2V: "/docs/api-reference/model-apis-kling-v3.0-std-i2v",
  KLING_V30_PRO_T2V: "/docs/api-reference/model-apis-kling-v3.0-pro-t2v",
  KLING_V30_PRO_I2V: "/docs/api-reference/model-apis-kling-v3.0-pro-i2v",
  TXT2VIDEO: "/docs/api-reference/model-apis-txt2video",
  SPEECH2TXT: "",
  SPEECH2TXT_TRANSLATION: "",
  TXT2SPEECH: "/docs/api-reference/model-apis-text-to-speech",
  VOICE_CLONING_INSTANT:
    "/docs/model-api/reference/audio/voice-clone-instant.html", // end of service
  VOICE_CLONING: "",
  IMG2VIDEO: "/docs/api-reference/model-apis-img2video",
  REMOVE_WATERMARK:
    "/docs/model-api/reference/image-editor/remove-watermark.html", // end of service
  MOTIONSYNC: "/docs/model-api/reference/video-generator/img2video-motion.html", // end of service
  ANIMATE_ANYONE:
    "/docs/model-api/reference/video-generator/animate-anyone.html#animate-anyone", // end of service
  IMG2MASK: "/docs/model-api/reference/image-editor/image-to-mask.html", // end of service
  IMG2PROMPT: "/docs/api-reference/model-apis-image-to-prompt",
  ADETAILER: "/docs/api-reference/model-apis-adetailer",
  RELIGHT: "/docs/model-api/reference/image-editor/relight.html", // end of service
  SD3: "/docs/guides/model-apis-stable-diffusion-3-medium",
  Facefusion: "/docs/model-api/reference/face-editor/facefusion.html", // end of service
  VIDEO_MERGE_FACE: "/docs/api-reference/model-apis-video-merge-face",
  FLUX1: "/docs/model-api/reference/image-generator/flux-1/dev.html", // end of service
  SANDBOX_INTRODUCTION: "/docs/guides/sandbox-overview",
  SANDBOX_E2B_TEMPLATE: "/docs/guides/sandbox-e2b-sandbox-template",
  SANDBOX_E2B_FILESYSTEM: "/docs/guides/sandbox-e2b-filesystem",
  CREATE_SANDBOX: "/docs/guides/sandbox-your-first-agent-sandbox",
  SANDBOX_PRICING: "/docs/guides/sandbox-pricing",
  LLM_RECOMMENDED: "/docs/guides/llm-recommended",
  SANDBOX_BROWSER_USE: "/docs/guides/sandbox-integrations-browser-use",
  SANDBOX_E2B_DESKTOP: "/docs/guides/sandbox-integrations-e2b-desktop",
  SANDBOX_LIFECYCLE: "/docs/guides/sandbox-lifecycle",
  SANDBOX_COMMANDS_BACKGROUND: "/docs/guides/sandbox-commands-background",
  SANDBOX_OPENCLAW_CLI: "/docs/guides/novita-openclaw-cli",
  SANDBOX_TEMPLATE: "/docs/guides/sandbox-template",
  SANDBOX_FILESYSTEM: "/docs/guides/sandbox-filesystem",
};

export const NOVITA_URL = {
  HOME: "/",
  CODING_PLAN: "/coding-plan",
  GPU_INDEX: "/gpus",
  GPU_BAREMETAL_INDEX: "/gpu-baremetal",
  GPU_CONSOLE_EXPLORE: "/gpus-console",
  GPU_CONSOLE_TEMPLATE_LIBRARY: "/gpus-console/templates-library",
  GPU_CONSOLE_APPLICATION: "/gpus-console/application",
  TEMPLATE_LIBRARY: "/templates-library",
  GPU_CONSOLE_EXPLORE_COMPATIBLE: "/gpus-console/explore",
  GPU_CONSOLE_INSTANCES: "/gpus-console/instances",
  GPU_CONSOLE_SERVERLESS: "/gpus-console/serverless",
  GPU_CONSOLE_SERVERLESS_DEPLOY: "/gpus-console/serverless-deploy",
  GPU_CONSOLE_STORAGE: "/gpus-console/storage",
  GPU_CONSOLE_TEMPLATES: "/gpus-console/templates",
  GPU_CONSOLE_BILLING: "/gpus-console/billing",
  GPU_CONSOLE_SETTINGS: "/gpus-console/settings",
  GPU_CONSOLE_JOBS: "/gpus-console/jobs",
  GPU_CONSOLE_IMAGE_PREWARM: "/gpus-console/image",
  PRICING: "/pricing",
  GPUS_SPOT: "/gpus-spot",
  MODEL_LIBRARY_INDEX: "/models",
  SANDBOX_INDEX: "/sandbox",
  MODEL_API_INDEX: "/model-api",
  MODEL_API_CONSOLE: "/models-console",
  MODEL_API_CONSOLE_LLM_DE: "/models-console/llm-dedicated-endpoints",
  MODEL_API_CONSOLE_IMAGE_DE: "/models-console/image-dedicated-endpoints",
  MODEL_API_CONSOLE_MODEL_LIBRARY: "/models-console/library",
  MODEL_API_CONSOLE_MODEL_DETAIL: "/models-console/model-detail",
  MODEL_API_CONSOLE_IMAGE_PLAYGROUND: "/models-console/multimodal-playground",
  MODEL_API_CONSOLE_MODEL: "/models-console/model-management",
  MODEL_API_CONSOLE_SETTINGS: "/models-console/settings",
  MODEL_API_CONSOLE_LLM_METRICS: "/models-console/llm-metrics",
  MODEL_API_CONSOLE_METRICS_USAGE: "/models-console/metrics/usage",
  MODEL_API_CONSOLE_LOGS: "/models-console/logs",
  MODEL_API_CATALOGUE: "/model-api/api-catalogue",
  SETTINGS: "/settings",
  SETTINGS_ACCOUNT: "/settings/account",
  SETTINGS_TEAM: "/settings/team",
  SETTINGS_KEYS: "/settings/key-management",
  SETTINGS_AUDIT: "/settings/audit-logs",
  SETTINGS_VERIFY: "/settings/verify",
  QUOTA_LIMITS: "/quota-limits",
  QUOTA_LIMITS_LLM: "/quota-limits/llm",
  QUOTA_LIMITS_IMAGE: "/quota-limits/image",
  QUOTA_LIMITS_SANDBOX: "/quota-limits/sandbox",
  KEYS: "/settings/key-management",
  BILLING_OVERVIEW: "/billing",
  BILLING_OVERVIEW_COMPATIBLE: "/billing/overview",
  BILLING_PAYMENT: "/billing",
  BILLING_TRANSACTIONS: "/billing/transactions",
  BILLING_DETAILS: "/billing/details",
  BILLING_BALANCE_WARNING: "/billing/balance-warning",
  BILLING_BUDGETS: "/billing/budgets",
  BILLING_CODING_PLAN: "/billing/coding-plan",
  VOUCHER: "/billing?voucher=1",
  MODEL_API_PRICING_ENTERPRISE: "/pricing?de=1",
  CONSOLE: "/console",
  MODEL_API_PLAYGROUND: "/models/image",
  LLM_CONSOLE_PLAYGROUND: "/models-console/llm-playground",
  MODEL_API_LLM_PLAYGROUND: "/models/llm/index",
  MODEL_API_VOICE_PLAYGROUND: "/models/voices",
  LLM_PAGE: "/models/llm",
  TERMS_OF_SERVICE: "/legal/terms-of-service",
  PRIVACY_POLICY: "/legal/privacy-policy",
  COOKIE_POLICY: "/legal/cookie-policy",
  DEDICATED_ENDPOINTS_SLA: "/legal/dedicated-endpoints-sla",
  USER_LOGIN: "/user/login",
  USER_REGISTER: "/user/register",
  USER_RESET_PASSWORD: "/user/reset",
  LANDING_PAGE_TEMPLATES: "/templates",
  /** 联盟计划落地页（`/affiliate` 仍保留为 redirect） */
  AFFILIATE: "/affiliate-new",
  REFERRAL: "/referral",
  TEAM_MANAGE: "/settings/team",
  TEAM_INVITE: "/team-invite",
  LLM_RATE_LIMIT_DOC: "/docs/model-api/reference/llm/rate-limits.html",
  DEDICATED_ENDPOINT_ORDER: "/dedicated-endpoint-order",
  END_OF_SERVICE: "/models/end-of-service",
  GPU_DETAIL: "/gpus/gpu/:id",
  DEDICATED_ENDPOINT: "/dedicated-endpoint",

  BLACK_FRIDAY: "/build-month",

  OAUTH: "/oauth/authorize",
  OAUTH_SUCCESS: "/oauth/authorize/success",
  SANDBOX_CONSOLE_VIEW: "/sandbox-console/view",
  SANDBOX_PRICING: "/pricing?sandbox=1",
  SANDBOX_CONSOLE_TEMPLATE: "/sandbox-console/template",
  SANDBOX_CONSOLE_USAGE: "/sandbox-console/usage",
  SANDBOX_CONSOLE: "/sandbox-console",
  SANDBOX_CONSOLE_QUOTA_LIMITS: "/sandbox-console/quota-limits",
  CONSOLE_PRICING: "/console/pricing-console",
  CONSOLE_PRICING_SANDBOX: "/console/pricing-console?sandbox=1",

  ARENA_SITE: "https://renderarena.novita.ai/api/auth/callback",
};

export const LOGIN_REQUIRED_URL = [
  NOVITA_URL.CONSOLE,
  NOVITA_URL.SETTINGS,
  NOVITA_URL.SETTINGS_TEAM,
  NOVITA_URL.SETTINGS_KEYS,
  NOVITA_URL.SETTINGS_AUDIT,
  NOVITA_URL.SETTINGS_VERIFY,
  NOVITA_URL.BILLING_OVERVIEW,
  NOVITA_URL.BILLING_OVERVIEW_COMPATIBLE,
  NOVITA_URL.BILLING_PAYMENT,
  NOVITA_URL.BILLING_TRANSACTIONS,
  NOVITA_URL.BILLING_DETAILS,
  NOVITA_URL.BILLING_BALANCE_WARNING,
  NOVITA_URL.BILLING_BUDGETS,
  NOVITA_URL.MODEL_API_CONSOLE,
  NOVITA_URL.MODEL_API_CONSOLE_IMAGE_DE,
  NOVITA_URL.MODEL_API_CONSOLE_LLM_DE,
  NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY,

  NOVITA_URL.MODEL_API_CONSOLE_MODEL,
  NOVITA_URL.MODEL_API_CONSOLE_SETTINGS,
  NOVITA_URL.MODEL_API_CONSOLE_LLM_METRICS,
  NOVITA_URL.MODEL_API_CONSOLE_METRICS_USAGE,
  NOVITA_URL.MODEL_API_CONSOLE_LOGS,

  NOVITA_URL.GPU_CONSOLE_INSTANCES,
  NOVITA_URL.GPU_CONSOLE_APPLICATION,
  NOVITA_URL.GPU_CONSOLE_SERVERLESS,
  NOVITA_URL.GPU_CONSOLE_STORAGE,
  NOVITA_URL.GPU_CONSOLE_TEMPLATES,
  NOVITA_URL.GPU_CONSOLE_IMAGE_PREWARM,
  NOVITA_URL.GPU_CONSOLE_BILLING,
  NOVITA_URL.GPU_CONSOLE_SETTINGS,
  NOVITA_URL.GPU_CONSOLE_JOBS,
  NOVITA_URL.QUOTA_LIMITS,
  NOVITA_URL.QUOTA_LIMITS_LLM,
  NOVITA_URL.QUOTA_LIMITS_IMAGE,
  NOVITA_URL.SANDBOX_CONSOLE,
  NOVITA_URL.SANDBOX_CONSOLE_VIEW,
  NOVITA_URL.SANDBOX_CONSOLE_TEMPLATE,
  NOVITA_URL.SANDBOX_CONSOLE_USAGE,
];

export const LOGIN_NOT_REDIRECT_URL = [
  NOVITA_URL.MODEL_API_PLAYGROUND,
  NOVITA_URL.PRICING,
  "/image",
  "/llm-api",
  NOVITA_URL.CONSOLE,
  NOVITA_URL.MODEL_API_CONSOLE,
  NOVITA_URL.GPU_CONSOLE_EXPLORE,
  NOVITA_URL.LLM_PAGE,
  "/serverless/console",
];

export const DISABLE_IN_EN_URL = [];

export const DISABLE_EXCLUDE_IN_EN_URL = ["/mainpage"];

export const FALL_BACK_IMAGE = "/fallback-img.png";

export const GOOGLE_FORM_URL = {
  SPEECH2TXT: "https://forms.gle/P1JoAMUgmKrrQWsy6",
  SPEECH2TXT_TRANSLATION: "https://forms.gle/wPpz1wWLhUUrawwD7",
  TXT2SPEECH: "https://forms.gle/GBrRncRqUAbh6HB47",
  VOICE_CLONING_INSTANT: "https://forms.gle/rGEHQZanXvJoUsGp9",
  VOICE_CLONING: "https://forms.gle/4nPpd731XzsmycH28",
  VIDEO_REMOVE_SUBTITLE: "https://forms.gle/mRtMRwxaQnjpth529",
  VIDEO_REMOVE_WATERMARK: "https://forms.gle/hVJLHVqugtrf9nvA6",
  VIDEO_TRANSLATE: "https://forms.gle/PBqwCSy5QTU2Ep4o8",
  VIDEO_REMOVE_OBJECT: "https://forms.gle/MBTY1gLYGRAsgUtj6",
  VIDEO_UPSCALE: "https://forms.gle/TRe2Dh6PqgXoAmij8",
  VIDEO_MAGIC_CUT: "https://forms.gle/aKfU7XEQfwbj4Cqf9",
};

export const DISCORD_INVITE_LINK = "https://discord.gg/YyPRAzwp7P";
export const DISCORD_ANNOUNCEMENTS_URL =
  "https://discord.com/channels/1113789452079337522/1115191937327173652";
export const BREVO_BOOK_LINK = "https://meetings-na2.hubspot.com/junyu";
export const SUPPORT_EMAIL_LINK = "support@novita.ai";
export const SALES_EMAIL_LINK = "sales@novita.ai";
export const MARKETING_EMAIL_LINK = "marketing@novita.ai";
export const SUPPLY_GPU_LINK = "gpu@novita.ai";
export const TRUST_CENTER_LINK = "https://trust.novita.ai";

export const STARTUP_PROGRAM_LINK =
  "https://blogs.novita.ai/novita-ai-startup-program/";

// AFFILIATE
export const AFFILIATE_LINK =
  "https://blogs.novita.ai/novita-ai-affiliate-program/";

const AFFILIATE_PORTAL_ORIGIN =
  process.env.NEXT_PUBLIC_ENV === "prod"
    ? "https://affiliates.novita.ai"
    : "https://sandboxnovitaai.tapfiliate.com";

export const AFFILIATE_PORTAL_URL = `${AFFILIATE_PORTAL_ORIGIN}/`;
export const AFFILIATE_LOGIN_URL = `${AFFILIATE_PORTAL_ORIGIN}/login`;

export const X_URL = "https://x.com/novita_labs";
export const TIKTOK_URL = "https://www.tiktok.com/@novita_labs";
export const FB_URL = "https://www.facebook.com/profile.php?id=61551601733151";
export const IG_URL = "https://www.instagram.com/novitalabs";
export const YTB_URL =
  "https://www.youtube.com/channel/UCXiLucAkStZWXOQy3ACiaig";
export const LINKEDIN_URL = "https://www.linkedin.com/company/novita-ai-labs/";

export const JOBS_URL = "https://jobs.ashbyhq.com/novita-ai";

export const CALENDLY_URL = "https://calendly.com/novita-ai/30min";
export const DOCS_SKILL_URL = "https://novita.ai/docs/skill.md";

const STRAPI_BASE_URL_EN_DEV = "https://api-strapi-staging.pplabs.tech/api";
const STRAPI_BASE_URL_EN_PROD = "https://api-strapi.pplabs.tech/api";

export const STRAPI_BASE_URL = ((env: string | undefined) => {
  return env === "prod" ? STRAPI_BASE_URL_EN_PROD : STRAPI_BASE_URL_EN_DEV;
})(process.env.NEXT_PUBLIC_ENV);
