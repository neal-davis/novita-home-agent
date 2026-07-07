import { DOCS_URL, NOVITA_URL } from "@/constants/urls";

type RouteMap = Record<string, string>;

export type ToolConfig = {
  name: string;
  description: string;
  parameterName: string;
  parameterDescription: string;
  routes: RouteMap;
  label: string;
};

const API_REFERENCE_PATH = "/docs/api-reference/model-apis-introduction";

export const WEBMCP_ROUTE_MAPS = {
  console: {
    overview: NOVITA_URL.CONSOLE,
    model_api: NOVITA_URL.MODEL_API_CONSOLE,
    gpu_cloud: NOVITA_URL.GPU_CONSOLE_EXPLORE,
    sandbox: NOVITA_URL.SANDBOX_CONSOLE,
    billing: NOVITA_URL.BILLING_OVERVIEW,
    api_keys: NOVITA_URL.SETTINGS_KEYS,
    quota_limits: NOVITA_URL.QUOTA_LIMITS,
    team: NOVITA_URL.SETTINGS_TEAM,
  },
  modelApi: {
    model_library: NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY,
    llm_playground: NOVITA_URL.LLM_CONSOLE_PLAYGROUND,
    image_playground: NOVITA_URL.MODEL_API_CONSOLE_IMAGE_PLAYGROUND,
    voice_playground: NOVITA_URL.MODEL_API_VOICE_PLAYGROUND,
    dedicated_endpoints: NOVITA_URL.MODEL_API_CONSOLE_LLM_DE,
    pricing: NOVITA_URL.PRICING,
  },
  gpu: {
    overview: NOVITA_URL.GPU_INDEX,
    explore_instances: NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE,
    instances: NOVITA_URL.GPU_CONSOLE_INSTANCES,
    serverless: NOVITA_URL.GPU_CONSOLE_SERVERLESS,
    deploy_serverless: NOVITA_URL.GPU_CONSOLE_SERVERLESS_DEPLOY,
    templates: NOVITA_URL.GPU_CONSOLE_TEMPLATES,
    storage: NOVITA_URL.GPU_CONSOLE_STORAGE,
    jobs: NOVITA_URL.GPU_CONSOLE_JOBS,
    settings: NOVITA_URL.GPU_CONSOLE_SETTINGS,
    pricing: `${NOVITA_URL.PRICING}?gpu=1`,
  },
  sandbox: {
    overview: NOVITA_URL.SANDBOX_INDEX,
    console: NOVITA_URL.SANDBOX_CONSOLE,
    templates: NOVITA_URL.SANDBOX_CONSOLE_TEMPLATE,
    usage: NOVITA_URL.SANDBOX_CONSOLE_USAGE,
    pricing: NOVITA_URL.SANDBOX_PRICING,
    docs: DOCS_URL.SANDBOX_INTRODUCTION,
  },
  docs: {
    quick_start: DOCS_URL.QUICK_START,
    model_api: DOCS_URL.MODEL_API,
    llm_api: DOCS_URL.LLM,
    serverless_gpus: DOCS_URL.SERVERLESS,
    gpu_instances: DOCS_URL.GPU_INSTANCE,
    sandbox: DOCS_URL.SANDBOX_INTRODUCTION,
    api_reference: API_REFERENCE_PATH,
  },
  auth: {
    login: NOVITA_URL.USER_LOGIN,
    register: NOVITA_URL.USER_REGISTER,
    reset_password: NOVITA_URL.USER_RESET_PASSWORD,
  },
} as const;

export const NOVITA_WEBMCP_TOOL_CONFIGS: ToolConfig[] = [
  {
    name: "open_novita_console",
    description:
      "Open a Novita console area such as overview, API keys, billing, quota limits, GPU Cloud, Model API, or Agent Sandbox.",
    parameterName: "section",
    parameterDescription: "The Novita console area to open.",
    routes: WEBMCP_ROUTE_MAPS.console,
    label: "Novita console",
  },
  {
    name: "open_model_api_workflow",
    description:
      "Open a Novita Model API workflow such as model library, playgrounds, dedicated endpoints, or pricing.",
    parameterName: "workflow",
    parameterDescription: "The Model API workflow to open.",
    routes: WEBMCP_ROUTE_MAPS.modelApi,
    label: "Novita Model API workflow",
  },
  {
    name: "open_gpu_workflow",
    description:
      "Open a Novita GPU Cloud workflow such as instances, serverless, templates, storage, jobs, settings, or pricing.",
    parameterName: "workflow",
    parameterDescription: "The GPU Cloud workflow to open.",
    routes: WEBMCP_ROUTE_MAPS.gpu,
    label: "Novita GPU workflow",
  },
  {
    name: "open_sandbox_workflow",
    description:
      "Open a Novita Agent Sandbox workflow such as overview, console, templates, usage, pricing, or docs.",
    parameterName: "workflow",
    parameterDescription: "The Agent Sandbox workflow to open.",
    routes: WEBMCP_ROUTE_MAPS.sandbox,
    label: "Novita Agent Sandbox workflow",
  },
  {
    name: "open_novita_docs",
    description:
      "Open Novita documentation for quick start, Model API, LLM API, Serverless GPUs, GPU Instances, Sandbox, or API reference.",
    parameterName: "topic",
    parameterDescription: "The Novita documentation topic to open.",
    routes: WEBMCP_ROUTE_MAPS.docs,
    label: "Novita docs",
  },
  {
    name: "open_novita_auth",
    description:
      "Open a Novita authentication page for login, registration, or password reset.",
    parameterName: "action",
    parameterDescription: "The authentication action to open.",
    routes: WEBMCP_ROUTE_MAPS.auth,
    label: "Novita auth page",
  },
];

export function createInputSchema(config: ToolConfig) {
  return {
    type: "object",
    properties: {
      [config.parameterName]: {
        type: "string",
        enum: Object.keys(config.routes),
        description: config.parameterDescription,
      },
    },
    required: [config.parameterName],
    additionalProperties: false,
  };
}

function getRoute(input: unknown, config: ToolConfig) {
  if (!input || typeof input !== "object") {
    throw new Error(`${config.name} requires an object input.`);
  }

  const value = (input as Record<string, unknown>)[config.parameterName];
  if (typeof value !== "string") {
    throw new Error(
      `${config.name} requires a string "${config.parameterName}" value.`,
    );
  }

  const route = config.routes[value];
  if (!route) {
    throw new Error(
      `${config.name} received unsupported ${config.parameterName}: ${value}.`,
    );
  }

  return { route, value };
}

function createNavigationTool(config: ToolConfig): WebMCPTool {
  return {
    name: config.name,
    description: config.description,
    inputSchema: createInputSchema(config),
    execute(input) {
      const { route, value } = getRoute(input, config);
      window.location.assign(route);

      return {
        content: [
          {
            type: "text",
            // i18n-disable-next-line
            text: `Opened ${config.label}: ${value} (${route})`,
          },
        ],
      };
    },
  };
}

export function createNovitaWebMCPTools(): WebMCPTool[] {
  return NOVITA_WEBMCP_TOOL_CONFIGS.map(createNavigationTool);
}
