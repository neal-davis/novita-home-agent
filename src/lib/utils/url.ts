import { DOCS_URL, NOVITA_SITE_ORIGIN } from "@/constants/urls";
import { REDIRECT_WHITELIST_DOMAINS } from "@/constants/auth";

export function pathFormat(url: string) {
  return url.replaceAll("/", "-");
}

export type Element =
  | "No_Auth"
  | "Header_Login_Button"
  | "LinkWithAuthority"
  | "LLM_Message_Input"
  | "Register"
  | "Reset_Password"
  | "Api_Response_Callback"
  | "Generate_Btn"
  | "Github_Redirect"
  | string;

export function getSearchParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/** 文档链接：相对 docs 路径拼成主站绝对 URL，绝对 URL 原样返回 */
export function makeDocsHref(path?: string): string {
  const rel = path ?? DOCS_URL.SANDBOX_INTRODUCTION;
  if (rel.startsWith("http://") || rel.startsWith("https://")) return rel;
  return `${NOVITA_SITE_ORIGIN}${rel.startsWith("/") ? rel : `/${rel}`}`;
}

// Google OAuth only allows stable callback URLs. Some domains use novita.ai as
// the callback host, then this check decides whether to relay back to the
// original domain from state.origin.
export function isUnifiedAuthRelayOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "dev.novita.ai" ||
      hostname === "novita-home-novita-ai.vercel.app" ||
      /^novita-home-git-[a-z0-9-]+-novita-ai\.vercel\.app$/.test(hostname)
    );
  } catch {
    return false;
  }
}

export function isMainEnvironmentOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === "novita.ai" ||
      hostname === "novita-home-git-main-novita-ai.vercel.app" ||
      hostname === "novita-home-git-stage-novita-ai.vercel.app" ||
      hostname === "novita-home-novita-ai.vercel.app"
    );
  } catch {
    return false;
  }
}

export function isTestEnvironmentOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    if (hostname === "dev.novita.ai") return true;
    if (!isUnifiedAuthRelayOrigin(origin)) return false;
    return !isMainEnvironmentOrigin(origin);
  } catch {
    return false;
  }
}

export function isWhitelistedRedirectUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return REDIRECT_WHITELIST_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}
