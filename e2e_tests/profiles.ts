/**
 * e2e 目标环境 profile —— catalog-driven 健康巡检（sweep.spec.ts）与未来深度 spec 共用。
 *
 * 把「页面来源(baseURL) / 后端类型(mock|real) / token 来源 / 是否允许写操作」收敛成一处配置，
 * 让同一套巡检能从 local-hermetic（CI 门禁，零外部依赖）一直跑到 online-prod（真机只读）。
 *
 * ⚠ CJS 注意：本仓库 package.json 无 "type":"module"，Playwright 以 CJS 转译 e2e_tests/**，
 * 禁用 import.meta（会报 "exports is not defined"）。本文件纯数据 + 纯函数，无 IO、无 import.meta。
 *
 * 选择：环境变量 E2E_PROFILE（默认 local-hermetic）。
 * 安全：requireConfirm 的 profile（生产）必须显式 E2E_CONFIRM_PROD=1 才能激活，防误打生产。
 */

export type BackendKind = "mock" | "real";

export interface EnvProfile {
  name: string;
  /** 浏览器导航的根地址（page.goto 的 base） */
  baseURL: string;
  /** mock = hermetic 拦截层（确定性，CI 门禁）；real = 打真实后端 */
  backendKind: BackendKind;
  /**
   * real profile：持有 JWT 的环境变量名（手动粘贴进 .env.e2e，gitignored）。
   * 真实登录有 cloudflare Turnstile 验证码，无法程序化登录——只能注入预取 token。
   */
  tokenEnvVar?: string;
  /** real profile：token 注入后导航的探针页（会触发鉴权 XHR）。 */
  authProbe?: string;
  /**
   * 探针页发出的「鉴权 XHR」pathname 片段——setup 等它并断言 200。
   * 坏/过期 token → 该接口 401/403 → setup fast-fail（URL 不重定向，故不能靠 URL 判鉴权）。
   */
  authProbeApi?: string;
  /** false → 巡检时机械 abort 一切非 GET 的真实后端请求（生产只读护栏） */
  allowMutations: boolean;
  /** true → 必须 E2E_CONFIRM_PROD=1 才能激活（防误触生产） */
  requireConfirm?: boolean;
}

/** real profile 的登录态落盘位置（已 gitignore：e2e_tests/.auth/）。config 与 setup 共用此常量。 */
export const SWEEP_AUTH_FILE = "e2e_tests/.auth/sweep.json";

// 本地 profile 的 baseURL 允许被 E2E_BASE_URL 覆盖（verify-task 端口 fallback :3101）；
// 线上 profile 的 baseURL 固定，不吃 E2E_BASE_URL（避免「打哪个站」被悄悄改掉）。
const localBase = process.env.E2E_BASE_URL || "http://localhost:3000";

const PROFILES: Record<string, EnvProfile> = {
  // Phase 1 默认：localhost + mock 后端。CI 门禁，零外部依赖、零 token、零生产风险。
  "local-hermetic": {
    name: "local-hermetic",
    baseURL: localBase,
    backendKind: "mock",
    allowMutations: true, // mock 层不触真实后端，写操作本就无副作用
  },
  // localhost（build:test 构建）+ 真实 dev 后端。即现有 smoke 的泛化。
  "local-live": {
    name: "local-live",
    baseURL: localBase,
    backendKind: "real",
    tokenEnvVar: "E2E_TOKEN_DEV",
    authProbe: "/billing",
    authProbeApi: "/v1/user/info",
    allowMutations: true, // dev 账号，可写
  },
  // 已部署的 dev/test 域名。默认值为占位符，按真实域名用 E2E_STAGING_URL 覆盖。
  "online-staging": {
    name: "online-staging",
    baseURL: process.env.E2E_STAGING_URL || "https://www-test.novita.ai",
    backendKind: "real",
    tokenEnvVar: "E2E_TOKEN_DEV",
    authProbe: "/billing",
    authProbeApi: "/v1/user/info",
    allowMutations: false,
  },
  // 生产站。只读 + 双重确认。这是本扩展的最终目标环境。
  "online-prod": {
    name: "online-prod",
    baseURL: "https://novita.ai",
    backendKind: "real",
    tokenEnvVar: "E2E_TOKEN_PROD",
    authProbe: "/billing",
    authProbeApi: "/v1/user/info",
    allowMutations: false, // 生产：绝对只读
    requireConfirm: true,
  },
};

const ACTIVE_PROFILE_NAME = process.env.E2E_PROFILE || "local-hermetic";

export function getActiveProfile(): EnvProfile {
  const profile = PROFILES[ACTIVE_PROFILE_NAME];
  if (!profile) {
    throw new Error(
      `未知 E2E_PROFILE="${ACTIVE_PROFILE_NAME}"，可选：${Object.keys(PROFILES).join(", ")}`,
    );
  }
  if (profile.requireConfirm && process.env.E2E_CONFIRM_PROD !== "1") {
    throw new Error(
      `profile "${profile.name}" 指向生产环境，必须显式设置 E2E_CONFIRM_PROD=1 才能运行（防误触）。`,
    );
  }
  return profile;
}

export { PROFILES };
