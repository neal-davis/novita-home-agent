export const AUTH_RESULT = "auth_res";
export const AUTH_RESULT_SUCCESS = "success";
export const AUTH_RESULT_FAILED = "failed";
export const AUTH_FAILED_REASON = "failed_reason";

export const AUTH_TYPE = "auth_type";
export const AUTH_TYPE_GOOGLE = "google";
export const AUTH_TYPE_GITHUB = "github";
export const AUTH_TYPE_HUGGINGFACE = "huggingface";
export const AUTH_IS_NEW_REGISTER = "is_reg";

export const AUTH_BIND_GITHUB = "bind_github";
export const AUTH_BIND_GITHUB_RESULT = "bind_github_result";

export const AUTH_CB_URL = "/api/auth";
export const AUTH_BIND_GITHUB_CB_URL = "/api/auth/bind-github";
export const AUTH_CB_URL_KEY = "auth_callback_url";
export const AUTH_BIND_GITHUB_CB_URL_KEY = "auth_bind_github_callback_url";
export const AUTH_STATE = "auth_state";
export const AUTH_UNIFIED_CALLBACK_ORIGIN = "https://novita.ai";

export const REDIRECT_WHITELIST_DOMAINS: string[] = [
  "localhost",
  "novita.ai",
  "chat.novita.ai",
];
