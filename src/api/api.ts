/* eslint-disable @typescript-eslint/no-unused-vars */
import { message } from "@/components/ui/standard/notify";
import { dealErrorText } from "@/lib/utils/dealError";
import { reduxStore } from "@/store";
import { logout } from "@/store/slice/userSlice";
import {
  NovitaSDK,
  NovitaError,
  ResponseCodeV2,
  ResponseCodeV3,
  APIErrReasonV3,
  Txt2VideoRequest,
  TaskStatus,
  MergeFaceRequest,
  RemoveTextRequest,
  RestoreFaceRequest,
  ReimagineRequest,
  OutpaintingRequest,
  Img2imgRequest,
  Img2imgV3Request,
  Txt2ImgRequest,
  Txt2ImgV3Request,
  RemoveBackgroundRequest,
  ReplaceBackgroundRequest,
  CleanupRequest,
  Img2VideoRequest,
  Img2VideoMotionRequest,
  InpaintingRequest,
} from "novita-sdk";
import {
  NovitaSDK as NovitaSDKV3,
  HunyuanVideoFastRequest,
  WanT2vRequest,
} from "novita-sdk-v3";
import Cookies from "js-cookie";
import { LOGIN_REQUIRED_URL } from "@/constants/urls";
import {
  getLocalizedPath,
  getPathnameLocale,
  getPathnameWithoutLocale,
} from "@/i18n/config";
import { PERMISSION_ERR_CODE } from "@/constants/constants";
import { reportError } from "@/lib/utils/reporter";
import mockAPIs from "../../mock";
const errorTextObj = {
  GET_TOKEN_FAILED: "Failed to obtain token",
  FORBIDDEN: "No permissions",
  UNAUTHORIZED: "Not recognized",
  USER_ALREADY_EXISTS: "The user already exists",
  INVALID_USER_OR_PASSWORD: "Username or password is incorrect",
  INVALID_CODE: "The verification code is incorrect",
  USER_NOT_FOUND: "The user ${0} not exists",
  USER_PHONE_NOT_CONSIST: "The user's mobile number does not match",
  USERNAME_FORMAT_ERROR: "The format of username is incorrect",
  SEND_CODE_TOO_FAST: "Verification code sent too frequently",
  INVALID_PUBLIC_KEY: "The public key format is incorrect",
  RESOURCE_NOT_FOUND: "Resource does not exist",
  CONFLICT: "Resource conflict",
  VALIDATOR_PARAM: "Parameter validation error",
  REQUEST: "Request error",
  OPERATION_LIMIT: "Operation restriction error",
  INSUFFICIENT_RESOURCE: "Insufficient resources",
  CLUSTER_STATUS: "Cluster status error",
  NODE_STATUS: "The node state is incorrect",
  DEPENDENT_RESOURCE_STATE: "Reliance on the wrong state of the resource",
  PREPAID_INSTANCE_NOT_SUPPORT_RELEASE:
    "Prepaid instances do not currently support release",
  WALLET_NOT_FOUND: "The wallet does not exist",
  WALLET_UNSUPPORT_RECHARGE_METHOD: "The recharge method is not supported",
  BALANCE_NOT_ENOUGH: "Insufficient balance",
  DE_BALANCE_NOT_ENOUGH:
    "Your account balance is insufficient to complete the transaction. Please top up your account to continue using our services or update your payment method to a valid credit card.",
  UNSUPPORTED_BILLING_MODE: "Unsupported billing method",
  EXPIRED_OR_BALANCE_NOT_ENOUGH: "Expired or insufficient balance",
  SERVERLESS_PRODUCT_NOT_FOUND: "Endpoint product does not exist",
  NETWORK_STORAGE_TOO_LARGE: "Maximum storage(${0} GB) capacity exceeded",
  CUR_CLUSTER_NETWORK_STORAGE_NOT_SUPPORT:
    "The current cluster does not support cloud storage",
  MIGRATION_JOB_NOT_BREAKABLE: "The migration job can not be interrupted",
  NETWORK_STORAGE_IN_USE: "Cloud storage in use",
  IMAGE_NOT_FOUND: "Image does not exist",
  CREATING_INSTANCE_NOT_SUPPORT_RENEWAL:
    "Unable to renew during instance creation",
  NETWORK_STORAGE_UNAVAILABLE: "The network storage is unavailable",
  CREATE_INSTANCE_LIMIT:
    "Your voucher and balance do not support creating more instances. Please recharge or stop the current running instances!",
  BANNED_USER: "Your account has been banned. Please contact the administrator",
  INVALID_COMMAND_PARAM: "The container startup command parameter is incorrect",
  IMAGE_AUTH_IN_USE: "The current image auth is being used",
  UNKNOWN_ERROR: "Unknown error",
  TASK_FAILED: "Task failed.",
  TASK_SUCCESS: "Task Success!",
  LOW_BALANCE: "Low balance.",
  HOST_UNAVAILABLE: "Host unavailable.",
  AUTH_FAILED: "Auth failed.",
  INVALID_PARAMS: "Invalid params.",
  SAMPLER_NOT_EXIST: "Sampler not exist.",
  TASK_TIMEOUT: "Task timeout.",
  TASK_CANCELED: "Task canceled.",
  NEED_LOGIN: "Need login.",
  IMAGE_URL_OR_AUTH_ERROR: "Image URL or auth error",
  IMAGE_TOO_LARGE: "Image size is too large, exceeds limit",
  IMAGE_PREWARM_NUM_LIMIT: "Image prewarm number exceeds limit",
  IMAGE_PREWARM_NO_NODES_AVAILABLE: "No available nodes for prewarm",
  CUDA_VERSION_INCOMPATIBLE: "CUDA version is incompatible",
  CREATE_GPU_NUM_LIMIT:
    "You have reached the current upper limit of GPU quota for concurrent operation: ${0} GPUs. If you need to use more GPU, please contact our technical support.",
  USER_NOT_ACTIVATED: "The user is not activated",
  USER_ALREADY_ACTIVATED: "The user is already activated",
  INVALID_USER_TOKEN: "The user token is invalid",
  VERIFY_TOKEN_FAILED: "Verify token failed",
  AUTH_UNSUPPORTED_PROVIDER: "The auth provider is unsupported",
  INSTANCE_LOCAL_STORAGE_NOT_FOUND: "Can not find local storage",
  ORDER_NOT_FOUND: "Can not find the order",
  SAVING_PLAN_ALREADY_EXISTS: "Saving plan is already existed",
  TOPUP_UNSUPPORTED_CHANNEL: "The topup channel is unsupported",
  SEND_MSG_ERROR: "Message sending error",
  VALIDATOR: "The parameter is not validated",
  EMAIL_INVALID: "Please enter a valid email address.",
  EMAIL_ILLEGAL_ERROR: "The email you provided is not supported",
  ILLEGAL_PARAMETERS: "The parameters are illegal",
  DB_ERROR: "There are some errors occured",
  PASSWORD_ERROR: "Password error",
  GENERATE_TOKEN_ERROR: "Generate token error",
  USER_NOT_ACTIVED: "The user is not actived",
  NOT_FOUNT: "Can not find the resource",
  SERVICE_ERROR: "There are some errors occured",
  SERVER_ERROR: "There are some errors occured",
  LIMIT_EXCEEDED_ERROR: "Exceeded limit error",
  MOBILE_PHONE_ERROR: "The phone no is not illegal",
  VERIFICATION_CODE_EXPIRED: "The verification code is expired",
  VERIFICATION_CODE_ERROR: "The verification code is wrong",
  SEND_SMS_ERROR: "SMS sending error",
  SEND_QUEUE_ERROR: "Sending queue error",
  CLOUDFLARE_CHECK_ERROR: "Cloudflare check error",
  STRIPE_NEW_CUSTOMER_FAILED: "Stripe create user failed",
  STRIPE_CHECKOUT_SESSION_FAILED: "Stripe pay failed",
  STRIPE_NEW_PAYMENT_ALREADY_EXISTS: "Stripe payment is already existed",
  STRIPE_DETACH_PAYMENT_FAILED: "Stripe payment detach failed",
  STRIPE_CUSTOMER_NOT_FOUND: "Stripe user is not existed",
  STRIPE_PAYMENT_METHOD_NOT_FOUND: "Stripe payment method is not existed",
  STRIPE_PAYMENT_INITENT_FAILED: "Stripe payment initent failed",
  STRIPE_PAYMENT_INTENT_NOT_FOUND: "Stripe payment initent is not existed",
  AUTO_RECHARGE_NOT_FOUND: "Auth recharge failed",
  ENTERPRISE_PLAN_NOT_FOUND: "The enterprise plan is not existed",
  ENTERPRISE_PLAN_SAVE_ERROR: "The enterprise plan save error",
  SUBMISSION_HAS_EXISTS: "The submission is existed",
  FIND_WHITE_LIST_ERROR: "Error occured when finding white list",
  NO_PERMISSION: "There is no permission",
  UPDATE_SUBMISSION_STATUS_ERROR: "Update submission status error",
  UPDATE_SUBMISSION_INFO_ERROR: "Update submission info error",
  UPDATE_SUBMISSION_List_ERROR: "Update submission list error",
  RECORD_USER_ERROR: "EP user is not existed",
  COUPON_NOT_EXISTS: "The coupon is not existed",
  COUPON_USER_ERROR: "The coupon user is not existed",
  COUPON_PLAN_ERROR: "Coupon plan error",
  COUPON_TIME_ERROR: "The coupon time is wrong",
  COUPON_HAS_USED: "The coupon has been used",
  CONFIGURATION_MARSHAL_ERROR: "Configuration marshal error",
  FIND_SUBMISSION_ERROR: "Submission error",
  NOT_ENTERPRISE_USER: "Not enterprise user error",
  TOO_MUCH_KEYS: "Each account can only generate a maximum of 10 keys",
  GET_USER_FAILED: "Get current user failed",
  MISSING_API_KEY: "The API key is missing",
  INVALID_API_KEY: "The API key is invalid",
  FEATURE_NOT_ALLOWED: "The feature is not allowed",
  API_NOT_ALLOWED: "The API is not allowed",
  MODEL_BASIC_NOT_FOUND: "Can not find the model basic",
  GET_MODEL_FAILED: "Get model failed",
  CREATE_MODEL_FAILED: "Create model failed",
  MODEL_NOT_FOUND: "The model is not found",
  INVALID_MODEL_PARAMS: "The model params is invalid",
  MODEL_ALREADY_EXISTED: "The model is already existed",
  FAILED_CHECK_UPLOAD_POLICY: "Failed to check upload policy",
  CREATE_EP_CONFIG_FAILED: "Create EP config failed",
  ANONYMOUS_ACCESS_QUOTA_EXCEEDS: "Anonymous access quota exceeds",
  BILLING_FAILED: "Billing failed",
  BILLING_AUTH_FAILED: "Billing auth failed",
  BILLING_BALANCE_NOT_ENOUGH: "Billing balance is not enough",
  LIST_BILL_ERROR: "Billing failed",
  LIST_BILL_TOO_FAST: "Billing frequency exceeds the limit",
  INVALID_REQUEST_BODY: "The request body is invalid",
  IMAGE_FILE_EXCEEDS_MAX_SIZE: " The image file exceeds max size",
  INVALID_IMAGE_FORMAT: "The image format is invalid",
  IMAGE_EXCEEDS_MAX_RESOLUTION: "The image exceeds max resolution",
  INTERNAL: "",
  INVALID_IMAGE_SIZE: "The image size is invalid",
  API_NOT_FOUND: "API not found",
  IMAGE_NO_FACE_DETECTED: "No face detected in the image",
  INVALID_CUSTOM_OUTPUT_PATH: "The custom output path is invalid",
  ILLEGAL_PROMPT: "The prompt is illegal",
  ILLEGAL_IMAGE_CONTENT: "The image content is illegal",
  FILE_EXCEEDS_MAX_SIZE: "The file exceeds max size",
  INVALID_AUDIO_FILE: "The audio file is invalid",
  EXCEEDS_MAX_UPLOAD_QUOTA: "Exceeds max upload quota",
  DELETE_MODEL_FAILED: "Delete model failed",
  CREATE_TASK_FAILED: "Create task failed",
  TASK_NOT_FOUND: "The task is not found",
  GET_RESULT_FAILED: "Get result failed",
  LIST_TASK_FAILED: "List task failed",
  TASK_NAME_EXISTED: "The task name is existed",
  BASE_MODEL_NOT_ALLOWD: "Base model is not allowed",
  QUERY_TASK_STATUS_FAILED: "Query task status failed",
  FREE_TRIAL_QUOTA_EXCEEDS: "Free trial quota exceeds",
  EMPTY_IMAGE_CAPTION: "Empty image caption",
  GET_QUEUE_STATUS_FAILED: "Get queue status failed",
  BALANCE_WARNING_LIMIT:
    "Balance warning count limit or balance warning open count limit or threshold interval is smaller than 5",
  USER_IS_LOCKED: "User is locked",
  PAYMENT_METHOD_LIMIT_EXCEEDED:
    "You've reached the maximum limit for updating your credit card. The last removal attempt failed because of this limit. You can remove the card again next month.",
  NOT_IN_TEAM: "User is not in the team",
  ROLE_NAME_ERROR: "Role name is invalid",
  USER_ALREADY_HAS_TEAM: "User has already created a team",
  TEAM_NAME_ALREADY_EXISTS: "Team name already exists",
  PERMISSION_DENIED: "Permission denied",
  EMAILS_TOO_MANY: "Too many emails",
  EMAILS_EMPTY: "Email list is empty",
  INVITE_ID_EMPTY: "Invite ID is empty",
  MEMBER_ALREADY_IN_TEAM:
    "The user is already a team member, no need to invite again",
  INVITE_TOKEN_PARSE_FAILED: "Invite link parsing failed",
  INVITE_TOKEN_EXPIRED: "Invite expired",
  INVITE_TOKEN_NOT_FOUND: "Invite not found",
  INVITE_TOKEN_SUSPEND: "Invite suspended",
  INVITE_TOKEN_CANCELED: "Invite canceled",
  INVITE_RECORD_NOT_FOUND: "Invite record not found",
  PHONES_TOO_MANY: "Too many phones",
  PHONES_EMPTY: "Phone list is empty",
  TEAM_MEMBER_LIMIT: "Team size limit exceeded.",
  TEAM_COUNT_LIMIT: "Team count limit reached",
  MAX_INVITE_PER_DAY: "Max invite per day limit reached",
  MAX_INVITE_PER_ACCOUNT: "User has reached the limit of being invited",
  IDENTIFY_NOT_DONE: "Identify not done, cannot perform this operation",
  GOOGLE_ACCOUNT_NOT_SUPPORT:
    "Your Google account is not supported. Please switch to another account.",
  GITHUB_ACCOUNT_NOT_SUPPORT:
    "Your Github account is not supported. Please switch to another account.",
  RATE_LIMIT_EXCEEDED:
    "You have exceeded the GPU instance quota. Please contact support to request an increase in your quota limit.",
  GITHUB_ACCOUNT_ALREADY_EXISTS:
    "Your GitHub account has already been linked to another account.",
  PAYMENT_METHOD_ALREADY_EXISTS:
    "Payment method updated. Please refresh the page.",
  TEMPLATE_IS_PRIVATE: "The template is private",
  TEMPLATE_NOT_FOUND: "This template is no longer available",
  CLOUDFLARE_VALIDATE_ERROR: "Registration blocked for security reasons.",
  CLOUDFLARE_RATE_LIMIT:
    "Too many sign-ups from this domain. Please try again later.",
  BUDGET_NOT_ENOUGH: "Insufficient account balance",
  NOT_ENOUGH_BALANCE: "Insufficient account balance",
  NOT_ENOUGH_BUDGET: "Insufficient budget",
  MEMBER_BUDGET_NOT_ENOUGH: "Insufficient budget",
  "BUDGET_LIMIT_TOO_SMALL ": "Budget cannot be set below the amount used",
  HUGGING_FACE_TOKEN_INVALID: "The Hugging Face token is invalid",
  REDEEM_CODE_INVALID: "Invalid redeem code",
  REDEEM_CODE_ALREADY_REDEEMED: "This code has already been redeemed",
  REDEEM_CODE_CAMPAIGN_NOT_STARTED: "This campaign has not started yet",
  REDEEM_CODE_CAMPAIGN_EXPIRED: "This campaign has expired",
  REDEEM_CODE_USER_ALREADY_REDEEMED:
    "You have already redeemed a code for this campaign",
  REDEEM_CODE_RATE_LIMITED: "Too many redeem attempts, please try again later",
};
const errorObjTmp = errorTextObj as any;

export const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.novita.ai";
export const service_base_url =
  process.env.NEXT_PUBLIC_BASE_URL || "https://api-server.novita.ai";
const novitaClient = new NovitaSDK("");
novitaClient.setBaseUrl(BASE_API_URL);
type RequestResponseType = "json" | "auto";

export function request({
  url,
  method = "GET",
  data = undefined,
  query = undefined,
  base_url = service_base_url,
  token,
  ignoreMsg = false,
  headers = {},
  signal,
  responseType = "json",
}: {
  url: string;
  method?: string;
  data?: any;
  query?: any;
  base_url?: string;
  token?: string;
  ignoreMsg?: boolean;
  headers?: any;
  signal?: AbortSignal;
  responseType?: RequestResponseType;
}) {
  const tokenString = typeof window !== "undefined" ? Cookies.get("token") : "";
  const mockBaseUrlPath =
    base_url && base_url.indexOf("http") === -1
      ? `/${base_url.split("/").at(-1)}`
      : "";
  const isMock =
    Boolean(process.env.NEXT_PUBLIC_USE_MOCK) &&
    process.env.NEXT_PUBLIC_ENV === "dev" &&
    (mockAPIs || []).some(
      (path) => `${mockBaseUrlPath}${url}`.indexOf(path) > -1,
    );
  if (isMock) {
    console.log(
      "mock",
      process.env.NEXT_PUBLIC_USE_MOCK,
      process.env.NEXT_PUBLIC_ENV,
      mockAPIs,
      url,
      base_url,
    );
  }
  let fetchUrl = "";
  if (isMock) {
    fetchUrl = process.env.NEXT_PUBLIC_MOCK_URL + `${mockBaseUrlPath}${url}`;
  } else {
    fetchUrl = base_url + url;
  }
  if (query) {
    fetchUrl += "?" + new URLSearchParams(query).toString();
  }
  return fetch(fetchUrl, {
    method: method,
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ?? `Bearer ${tokenString ?? ""}`,
      ...headers,
    },
    cache: "no-cache",
    body: data == undefined ? undefined : JSON.stringify(data),
    signal,
  })
    .then((res: Response) => {
      if (res.status == 404) {
        return {
          code: 404,
          reason: "UNKNOWN_ERROR",
        };
      }

      if (responseType === "auto") {
        const contentType = res.headers.get("content-type") || "";
        const isJson =
          contentType.includes("application/json") ||
          contentType.includes("+json");

        if (isJson) {
          return res.json();
        }

        if (!res.ok) {
          return {
            code: res.status,
            reason: "UNKNOWN_ERROR",
          };
        }

        return res.blob();
      }

      return res.json();
    })
    .then((res) => {
      if (res.code === 401) {
        reduxStore.store.dispatch(logout());
        const currentPathname = window.location.pathname;
        const businessPathname = getPathnameWithoutLocale(currentPathname);
        if (
          window.location.href.indexOf("login=true") === -1 &&
          LOGIN_REQUIRED_URL.includes(businessPathname)
        ) {
          const locale = getPathnameLocale(currentPathname).locale;
          const redirect = `${currentPathname}${window.location.search}${window.location.hash}`;
          const loginPath = `/user/login?login=true&redirect=${encodeURIComponent(
            redirect,
          )}`;
          window.location.href = locale
            ? getLocalizedPath(loginPath, locale)
            : loginPath;
        }
        return Promise.reject("401");
      } else if (res.code >= 400) {
        if (res.reason === "USER_IS_LOCKED") {
          return Promise.reject(res);
        }
        if (!ignoreMsg) {
          const errTxtTmp =
            errorObjTmp[res?.reason] ||
            res?.message ||
            errorObjTmp["UNKNOWN_ERROR"];
          const errTxt = dealErrorText(errTxtTmp, res?.metadata);
          // Do not show the toast notification without team permission
          // No permission is also a normal situation, which is uniformly displayed and feedback by the front end
          if (!PERMISSION_ERR_CODE.includes(res?.reason)) {
            if (res.code === 403) {
              reportError({
                errorNo: `Unknow 403 code ${res?.reason}`,
                errorInfo:
                  "Check whether the 403 error code is consistent between the frontend and backend.",
                level: 2,
                type: "request",
              });
            }
          }
          if (
            res.reason === "INSUFFICIENT_RESOURCE" ||
            res.reason === "CUDA_VERSION_INCOMPATIBLE" ||
            res.reason === "CREATE_GPU_NUM_LIMIT"
          ) {
            return Promise.reject(res);
          } else {
            message.error(errTxt);
            return Promise.reject({
              ...res,
              errInfo: errTxt,
            });
          }
        } else {
          if (
            [
              "INSUFFICIENT_RESOURCE",
              "CUDA_VERSION_INCOMPATIBLE",
              "CREATE_GPU_NUM_LIMIT",
              "MIGRATE_INSUFFICIENT_RESOURCE",
              "DE_BALANCE_NOT_ENOUGH",
              "HUGGING_FACE_GATED",
              "LLM_DEDICATED_ENDPOINT_MODEL_NOT_SUPPORTED",
            ].includes(res.reason)
          ) {
            return Promise.reject({
              ...res,
              errInfo: errorObjTmp[res?.reason],
            });
          } else {
            return Promise.reject(res.message);
          }
        }
      }
      return Promise.resolve(res);
    })
    .catch((error) => {
      throw error;
    });
}
export function requestText({
  url,
  method = "GET",
  data = undefined,
  query = undefined,
  base_url = service_base_url,
  token,
  headers = {},
  signal,
}: {
  url: string;
  method?: string;
  data?: any;
  query?: any;
  base_url?: string;
  token?: string;
  headers?: any;
  signal?: AbortSignal;
}) {
  const tokenString = typeof window !== "undefined" ? Cookies.get("token") : "";
  const mockBaseUrlPath =
    base_url && base_url.indexOf("http") === -1
      ? `/${base_url.split("/").at(-1)}`
      : "";
  const isMock =
    Boolean(process.env.NEXT_PUBLIC_USE_MOCK) &&
    process.env.NEXT_PUBLIC_ENV === "dev" &&
    (mockAPIs || []).some(
      (path) => `${mockBaseUrlPath}${url}`.indexOf(path) > -1,
    );
  if (isMock) {
    console.log(
      "mock",
      process.env.NEXT_PUBLIC_USE_MOCK,
      process.env.NEXT_PUBLIC_ENV,
      mockAPIs,
      url,
      base_url,
    );
  }
  let fetchUrl = "";
  if (isMock) {
    fetchUrl = process.env.NEXT_PUBLIC_MOCK_URL + `${mockBaseUrlPath}${url}`;
  } else {
    fetchUrl = base_url + url;
  }
  if (query) {
    fetchUrl += "?" + new URLSearchParams(query).toString();
  }
  return fetch(fetchUrl, {
    method: method,
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ?? `Bearer ${tokenString ?? ""}`,
      ...headers,
    },
    cache: "no-cache",
    body: data == undefined ? undefined : JSON.stringify(data),
    signal,
  })
    .then((res: any) => {
      if (res.status == 404) {
        return {
          code: 404,
          reason: "UNKNOWN_ERROR",
        };
      } else {
        return res.text();
      }
    })
    .then((res) => {
      return Promise.resolve(res);
    })
    .catch((error) => {
      throw error;
    });
}
export function requestInServerEnv({
  url,
  method = "GET",
  data = undefined,
  query = undefined,
  base_url = service_base_url,
  token,
  headers = {},
}: {
  url: string;
  method?: string;
  data?: any;
  query?: any;
  base_url?: string;
  token: string;
  headers?: any;
}) {
  let fetchUrl = base_url + url;
  if (query) {
    fetchUrl += "?" + new URLSearchParams(query).toString();
  }
  return fetch(fetchUrl, {
    method: method,
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...headers,
    },
    cache: "no-cache",
    body: data == undefined ? undefined : JSON.stringify(data),
  })
    .then((res: any) => {
      if (res.status == 404) {
        return {
          code: 404,
          reason: "UNKNOWN_ERROR",
        };
      } else {
        return res.json();
      }
    })
    .catch((error) => {
      reportError({
        errorNo: `requestInServerEnv-error-${fetchUrl}`,
        errorInfo: `${fetchUrl} fetch in server side error, ${error}`,
        level: 0,
        type: "request",
      });
      return {};
    });
}
export function getFailMsg(code: number, taskStatus?: number): string {
  if (taskStatus) {
    return errorObjTmp["TASK_FAILED"];
  }
  switch (code) {
    case ResponseCodeV2.OK: {
      return errorObjTmp["TASK_SUCCESS"];
    }
    case ResponseCodeV2.COST_BALANCE_FAILURE: {
      return errorObjTmp["LOW_BALANCE"];
    }
    case ResponseCodeV2.HOST_UNAVAILABLE: {
      return errorObjTmp["HOST_UNAVAILABLE"];
    }
    case ResponseCodeV2.INVALID_AUTH: {
      return errorObjTmp["AUTH_FAILED"];
    }
    case ResponseCodeV2.PARAM_RANGE_OUT_OF_LIMIT: {
      return errorObjTmp["INVALID_PARAMS"];
    }
    case ResponseCodeV2.SAMPLER_NOT_EXIST: {
      return errorObjTmp["SAMPLER_NOT_EXIST"];
    }
    case ResponseCodeV2.TIMEOUT: {
      return errorObjTmp["TASK_TIMEOUT"];
    }
    case ResponseCodeV2.INTERNAL_ERROR: {
      return errorObjTmp["TASK_FAILED"];
    }
    default: {
      return errorObjTmp["TASK_FAILED"];
    }
  }
}
export function getFailMsgV3(
  code: number,
  reason?: string,
  msg?: string,
): string {
  if (code === ResponseCodeV3.CANCELED) {
    return errorObjTmp["TASK_CANCELED"];
  }
  if (code === ResponseCodeV3.REQUEST_INVALID) {
    if (reason === APIErrReasonV3.BALANCE_NOT_ENOUGH) {
      return errorObjTmp["LOW_BALANCE"];
    }
  }
  if (code === ResponseCodeV3.TOO_MANY_REQ) {
    if (reason === APIErrReasonV3.ANONYMOUS_ACCESS_QUOTA_EXCEEDS) {
      return errorObjTmp["NEED_LOGIN"];
    }
  }
  // Handle FORBIDDEN error code
  if (code === 403) {
    if (reason === "NOT_ENOUGH_BUDGET") {
      return errorObjTmp["NOT_ENOUGH_BUDGET"];
    }
    if (reason === "NOT_ENOUGH_BALANCE") {
      return errorObjTmp["NOT_ENOUGH_BALANCE"];
    }
  }
  return msg || errorObjTmp["TASK_FAILED"];
}
export function textToImageWithProgress(
  key: string,
  params: Txt2ImgRequest,
  onProgress: (imgUrls: string[]) => void,
  onFinish: (imgUrls: string[], info?: string) => void,
  onFail: (code: number, msg: string, taskStatus?: number) => void,
  onSubmitTaskSuccess: (taskId: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  novitaClient.setNovitaKey(key);
  novitaClient
    .txt2Img(params, opts && { signal: opts.abortSignal, source: opts.source })
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onSubmitTaskSuccess(res.task_id);
        let timer: NodeJS.Timeout | null = null;
        const getProgress = () => {
          checkProgress(
            key,
            res.task_id,
            {
              onQueue: () => {
                timer = setTimeout(getProgress, 1000);
              },
              onProgress: (imgUrls: string[]) => {
                onProgress(imgUrls);
                timer = setTimeout(getProgress, 1000);
              },
              onFinish: (urls: string[], info?: string) => {
                onFinish(urls, info);
                timer && clearTimeout(timer);
              },
              onFail: (code: number, msg: string, taskStatus?: number) => {
                if (code !== ResponseCodeV3.NETWORK || msg !== "ERR_NETWORK") {
                  onFail(code, msg, taskStatus);
                  timer && clearTimeout(timer);
                }
              },
            },
            opts,
          );
        };
        getProgress();
        if (opts && opts.abortSignal) {
          opts?.abortSignal.addEventListener("abort", () => {
            timer && clearTimeout(timer);
          });
        }
      } else {
        onFail(-1, "task failed");
      }
    })
    .catch((err) => {
      console.error("txt2Img error:", err);
      onFail(err.code, err.reason || err.msg);
    });
}
export function textToImageWithProgressV3(
  key: string,
  params: Txt2ImgV3Request,
  onProgress: (imgUrls: string[]) => void,
  onFinish: (
    imgUrls: string[],
    info?: string,
    extra?: Record<string, any>,
  ) => void,
  onFail: (code: number, msg: string, taskStatus?: number) => void,
  onSubmitTaskSuccess: (taskId: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  novitaClient.setNovitaKey(key);
  novitaClient
    .txt2ImgV3(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onSubmitTaskSuccess(res.task_id);
        let timer: NodeJS.Timeout | null = null;
        const checker = () => {
          checkProgressV3(key, res.task_id, opts, {
            onQueue: () => {
              timer = setTimeout(checker, 1000);
            },
            onProgress: (imgUrls: string[]) => {
              onProgress(imgUrls);
              timer = setTimeout(checker, 1000);
            },
            onFinish: (
              urls: string[],
              info?: string,
              extra?: Record<string, any>,
            ) => {
              onFinish(urls, info, extra);
            },
            onFail: (code: number, reason?: string) => {
              if (
                !(code === ResponseCodeV3.NETWORK && reason === "ERR_NETWORK")
              ) {
                onFail(code, reason || "");
              }
            },
          });
        };
        timer = setTimeout(checker, 1000);
        if (opts && opts.abortSignal) {
          opts.abortSignal.addEventListener("abort", () => {
            timer && clearTimeout(timer);
          });
        }
      } else {
        onFail(-1, "task failed");
      }
    })
    .catch((err) => {
      console.error("txt2Img error:", err);
      onFail(err.code, err.reason || err.msg);
    });
}
export function imageToImageWithProgress(
  key: string,
  params: Img2imgRequest,
  onProgress: (imgUrls: string[]) => void,
  onFinish: (imgUrls: string[], info?: string) => void,
  onFail: (code: number, msg: string, taskStatus?: number) => void,
  syncTaskId: (taskId: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  novitaClient.setNovitaKey(key);
  novitaClient
    .img2img(params, opts && { signal: opts.abortSignal, source: opts.source })
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        syncTaskId(res.task_id);
        let timer: NodeJS.Timeout | null = null;
        const getProgress = () => {
          checkProgress(
            key,
            res.task_id,
            {
              onQueue: () => {
                timer = setTimeout(getProgress, 1000);
              },
              onProgress: (imgUrls: string[]) => {
                onProgress(imgUrls);
                timer = setTimeout(getProgress, 1000);
              },
              onFinish: (urls: string[], info?: string) => {
                onFinish(urls, info);
                timer && clearTimeout(timer);
              },
              onFail: (code: number, msg: string, taskStatus?: number) => {
                if (code !== ResponseCodeV3.NETWORK || msg !== "ERR_NETWORK") {
                  onFail(code, msg, taskStatus);
                  timer && clearTimeout(timer);
                }
              },
            },
            opts,
          );
        };
        getProgress();
        if (opts && opts.abortSignal) {
          opts.abortSignal.addEventListener("abort", () => {
            timer && clearTimeout(timer);
          });
        }
      } else {
        onFail(-1, "no task id");
      }
    })
    .catch((err) => {
      console.error("img2img error:", err);
      onFail(err.code, err.reason || err.msg);
    });
}
export function imageToImageWithProgressV3(
  key: string,
  params: Img2imgV3Request,
  onProgress: (imgUrls: string[]) => void,
  onFinish: (
    imgUrls: string[],
    info?: string,
    extra?: Record<string, any>,
  ) => void,
  onFail: (code: number, msg: string, taskStatus?: number) => void,
  onSubmitTaskSuccess: (taskId: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  novitaClient.setNovitaKey(key);
  novitaClient
    .img2ImgV3(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onSubmitTaskSuccess(res.task_id);
        let timer: NodeJS.Timeout | null = null;
        const checker = () => {
          checkProgressV3(key, res.task_id, opts, {
            onQueue: () => {
              timer = setTimeout(checker, 1000);
            },
            onProgress: (imgUrls: string[]) => {
              onProgress(imgUrls);
              timer = setTimeout(checker, 1000);
            },
            onFinish: (
              urls: string[],
              info?: string,
              extra?: Record<string, any>,
            ) => {
              onFinish(urls, info, extra);
            },
            onFail: (code: number, reason?: string) => {
              if (
                !(code === ResponseCodeV3.NETWORK && reason === "ERR_NETWORK")
              ) {
                onFail(code, reason || "");
              }
            },
          });
        };
        timer = setTimeout(checker, 1000);
        if (opts && opts.abortSignal) {
          opts.abortSignal.addEventListener("abort", () => {
            timer && clearTimeout(timer);
          });
        }
      } else {
        onFail(-1, "task failed");
      }
    })
    .catch((err) => {
      console.error("img2Img error:", err);
      onFail(err.code, err.reason || err.msg);
    });
}
export function upscaleWithProgress(
  key: string,
  params: any,
  onProgress: (imgUrls: string[]) => void,
  onFinish: (imgUrls: string[]) => void,
  onFail: (code: number, msg: string, taskStatus?: number) => void,
  syncTaskId: (taskId: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  return;
}
export async function upscaleWithProgressV3(
  key: string,
  params: any,
  onProgress: (imgUrls: string[]) => void,
  onFinish: (
    imgUrls: string[],
    info?: string,
    extra?: Record<string, any>,
  ) => void,
  onFail: (code: number, msg: string, taskStatus?: number) => void,
  onSubmitTaskSuccess: (taskId: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return;
}
function novitaAPIWebRequest(
  key: string,
  endpoint: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  request({
    base_url: BASE_API_URL,
    url: endpoint,
    method: "POST",
    data: params,
    ignoreMsg: true,
    headers: {
      Authorization: "Bearer " + key,
    },
  })
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onFinish(res.task_id);
      } else {
        onFail(-1, "no task id");
      }
    })
    .catch((err) => {
      console.error(`${endpoint} request error:`, err);
      onFail(err.code, err.reason, err.msg);
    });
}
export function lcmTxt2Img(
  key: string,
  params: any,
  onFinish: (urls: string[], taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return;
}
export function lcmImg2Img(
  key: string,
  params: any,
  onFinish: (urls: string[], taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return;
}
function checkProgress(
  key: string,
  taskId: string,
  callbacks: {
    onQueue?: () => void;
    onProgress: (imgUrls: string[]) => void;
    onFinish: (imgUrls: string[], resultInfo?: string) => void;
    onFail: (code: number, msg: string, taskStatus?: number) => void;
  },
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .progress(
      {
        task_id: taskId,
      },
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita task progress:", res);
      switch (res.status) {
        case 2: {
          console.log("novita task finished");
          callbacks.onFinish(res.imgs, res.info);
          break;
        }
        case 3:
        case 4: {
          console.error("novita task fail");
          callbacks.onFail(0, res.failed_reason || "", res.status);
          break;
        }
        case 1: {
          console.log("novita task progress");
          if (res.current_images) {
            if (Array.isArray(res.current_images)) {
              callbacks.onProgress(
                res.current_images.map((img) =>
                  img ? `data:image/jpeg;base64,${img}` : "",
                ),
              );
            } else {
              callbacks.onProgress([
                `data:image/jpeg;base64,${res.current_images}`,
              ]);
            }
          }
          break;
        }
        case 0: {
          console.log("novita task initializing");
          callbacks.onProgress([]);
          break;
        }
        default: {
          console.log("novita task unknown status:", res.status);
          callbacks.onProgress([]);
        }
      }
    })
    .catch((err) => {
      console.error("get novita task progress error:", err);
      callbacks.onFail(err.code, err.reason || err.msg);
    });
}
export function checkProgressV3(
  key: string,
  taskId: string,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
  callbacks?: {
    onProgress?: (imgUrls: string[], progress: number) => void;
    onFinish?: (
      imgUrls: string[],
      info?: string,
      extra?: Record<string, any>,
    ) => void;
    onFail?: (code: number, reason?: string, msg?: string) => void;
    onQueue?: () => void;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .progressV3(
      {
        task_id: taskId,
      },
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita task progress:", res);
      switch (res.task.status) {
        case TaskStatus.SUCCEED: {
          console.log("novita task finished");
          if (
            res.images &&
            Array.isArray(res.images) &&
            res.images.length > 0
          ) {
            callbacks?.onFinish?.(
              res.images.map((img) => img.image_url) || [],
              "",
              (res as any).extra,
            );
          }
          if (
            res.videos &&
            Array.isArray(res.videos) &&
            res.videos.length > 0
          ) {
            callbacks?.onFinish?.(
              res.videos.map((img) => img.video_url) || [],
              "",
              (res as any).extra,
            );
          }
          break;
        }
        case TaskStatus.FAILED: {
          console.error("novita task fail");
          callbacks?.onFail?.(0, res.task.reason);
          break;
        }
        case TaskStatus.PROCESSING: {
          console.log("novita task processing");
          let urls: string[] = [];
          if (
            res.images &&
            Array.isArray(res.images) &&
            res.images.length > 0
          ) {
            urls = res.images.map((img) => img.image_url);
          }
          if (
            res.videos &&
            Array.isArray(res.videos) &&
            res.videos.length > 0
          ) {
            urls = res.videos.map((vid) => vid.video_url);
          }
          callbacks?.onProgress?.(urls, res.task.progress_percent);
          break;
        }
        case TaskStatus.QUEUED: {
          console.log("novita task queueing");
          callbacks?.onQueue?.();
          break;
        }
        default: {
          console.log("novita task unknown status:", res.task.status);
          callbacks?.onQueue?.();
        }
      }
    })
    .catch((err) => {
      console.error("get novita task progress error:", err);
      callbacks?.onFail?.(err.code, err.reason, err.msg);
    });
}
export function outpainting(
  key: string,
  params: OutpaintingRequest,
  onFinish: (url: string, taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .outpainting(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita outpainting:", res);
      if (res && res.image_file) {
        onFinish(
          `data:image/${res.image_type || "png"};base64,${res.image_file}`,
          (res as any)?.task?.task_id,
        );
      } else {
        onFail(
          res.code || -1,
          res.reason,
          res.message,
          (res as any)?.metadata?.task_id,
        );
      }
    })
    .catch((err) => {
      console.error("novita outpainting error:", err);
      onFail(
        err.code,
        err.reason,
        err.message,
        (err as any)?.metadata?.task_id,
      );
    });
}
export function removeBackground(
  key: string,
  params: RemoveBackgroundRequest,
  onFinish: (url: string, taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .removeBackground(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita remove background:", res);
      if (res && res.image_file) {
        onFinish(
          `data:image/${res.image_type || "png"};base64,${res.image_file}`,
          (res as any)?.task?.task_id,
        );
      } else {
        onFail(
          res.code || -1,
          res.reason,
          res.message,
          (res as any)?.metadata?.task_id,
        );
      }
    })
    .catch((err) => {
      console.error("novita remove background error:", err);
      onFail(err.code, err.reason, err.msg, (err as any)?.metadata?.task_id);
    });
}
export function replaceBackground(
  key: string,
  params: ReplaceBackgroundRequest,
  onFinish: (url: string, taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .replaceBackground(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita replace background:", res);
      if (res && res.image_file) {
        onFinish(
          `data:image/${res.image_type || "png"};base64,${res.image_file}`,
          (res as any)?.task?.task_id,
        );
      } else {
        onFail(
          res.code || -1,
          res.reason,
          res.message,
          (res as any)?.metadata?.task_id,
        );
      }
    })
    .catch((err) => {
      console.error("novita replace background error:", err);
      onFail(err.code, err.reason, err.msg, (err as any)?.metadata?.task_id);
    });
}
export function cleanup(
  key: string,
  params: CleanupRequest,
  onFinish: (url: string, taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .cleanup(params, opts && { signal: opts.abortSignal, source: opts.source })
    .then((res) => {
      console.log("novita cleanup:", res);
      if (res && res.image_file) {
        onFinish(
          `data:image/${res.image_type || "png"};base64,${res.image_file}`,
          (res as any)?.task?.task_id,
        );
      } else {
        onFail(
          res.code || -1,
          res.reason,
          res.message,
          (res as any)?.metadata?.task_id,
        );
      }
    })
    .catch((err: NovitaError) => {
      console.error("novita cleanup error:", err);
      onFail(err.code, err.reason, err.msg, (err as any)?.metadata?.task_id);
    });
}
export function mixpose(
  key: string,
  params: any,
  onFinish: (url: string, taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return;
}
export function doodle(
  key: string,
  params: any,
  onFinish: (url: string, taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return;
}
export function uploadModel(key: string, params: any) {
  return request({
    url: "/v3/model",
    method: "POST",
    data: params,
    token: key,
    base_url: BASE_API_URL,
  });
}
export function replaceSky(
  key: string,
  params: any,
  onFinish: (url: string, taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return;
}
export function replaceObjectWithProgress(
  key: string,
  params: any,
  onProgress: (imgUrls: string[]) => void,
  onFinish: (
    imgUrls: string[],
    info?: string,
    extra?: Record<string, any>,
  ) => void,
  onFail: (code: number, reason: string, msg?: string) => void,
  syncTaskId: (taskId: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  return;
}
export function mergeFace(
  key: string,
  params: MergeFaceRequest,
  onFinish: (url: string, taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .mergeFace(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita merge face:", res);
      if (res && res.image_file) {
        onFinish(
          `data:image/${res.image_type || "png"};base64,${res.image_file}`,
          (res as any)?.task?.task_id,
        );
      } else {
        onFail(
          res.code || -1,
          res.reason,
          res.message,
          (res as any)?.metadata?.task_id,
        );
      }
    })
    .catch((err) => {
      console.error("novita merge face error:", err);
      onFail(err.code, err.reason, err.msg, (err as any)?.metadata?.task_id);
    });
}
export function removeText(
  key: string,
  params: RemoveTextRequest,
  onFinish: (url: string, taskId?: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .removeText(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita remove text:", res);
      if (res && res.image_file) {
        onFinish(
          `data:image/${res.image_type || "png"};base64,${res.image_file}`,
          (res as any)?.task?.task_id,
        );
      } else {
        onFail(
          res.code || -1,
          res.reason,
          res.message,
          (res as any)?.metadata?.task_id,
        );
      }
    })
    .catch((err) => {
      console.error("novita remove text error:", err);
      onFail(err.code, err.reason, err.msg, (err as any)?.metadata?.task_id);
    });
}
export function restoreFace(
  key: string,
  params: RestoreFaceRequest,
  onFinish: (url: string, taskId?: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .restoreFace(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita restore face:", res);
      if (res && res.image_file) {
        onFinish(
          `data:image/${res.image_type || "png"};base64,${res.image_file}`,
          (res as any)?.task?.task_id,
        );
      } else {
        onFail(
          res.code || -1,
          res.reason,
          res.message,
          (res as any)?.metadata?.task_id,
        );
      }
    })
    .catch((err) => {
      console.error("novita restore face error:", err);
      onFail(err.code, err.reason, err.msg, (err as any)?.metadata?.task_id);
    });
}
export function reimagine(
  key: string,
  params: ReimagineRequest,
  onFinish: (url: string, taskId?: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  novitaClient.setNovitaKey(key);
  novitaClient
    .reimagine(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      console.log("novita reimagine:", res);
      if (res && res.image_file) {
        onFinish(
          `data:image/${res.image_type || "png"};base64,${res.image_file}`,
          (res as any)?.task?.task_id,
        );
      } else {
        onFail(
          res.code || -1,
          res.reason,
          res.message,
          (res as any)?.metadata?.task_id,
        );
      }
    })
    .catch((err) => {
      console.error("novita reimagine error:", err);
      onFail(err.code, err.reason, err.msg, (err as any)?.metadata?.task_id);
    });
}
export function createTile(
  key: string,
  params: any,
  onFinish: (url: string, taskId?: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return;
}
export function wanT2v(
  key: string,
  params: WanT2vRequest,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const novitaClient = new NovitaSDKV3(key);
  novitaClient.setBaseUrl(BASE_API_URL);
  novitaClient
    .wanT2v(params, opts && { signal: opts.abortSignal, source: opts.source })
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onFinish(res.task_id);
      } else {
        onFail(-1, "no task id");
      }
    })
    .catch((err) => {
      console.error("wan-t2v request error:", err);
      onFail(err.code, err.reason, err.msg);
    });
}
export function wanI2v(
  key: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const endpoint = "/v3/async/wan-i2v";
  novitaAPIWebRequest(key, endpoint, params, onFinish, onFail, opts);
}
export function wan26T2v(
  key: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const endpoint = "/v3/async/wan2.6-t2v";
  novitaAPIWebRequest(key, endpoint, params, onFinish, onFail, opts);
}
export function wan26I2v(
  key: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const endpoint = "/v3/async/wan2.6-i2v";
  novitaAPIWebRequest(key, endpoint, params, onFinish, onFail, opts);
}
export function wan26V2v(
  key: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const endpoint = "/v3/async/wan2.6-v2v";
  novitaAPIWebRequest(key, endpoint, params, onFinish, onFail, opts);
}
export function klingV16T2v(
  key: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const endpoint = "/v3/async/kling-v1.6-t2v";
  novitaAPIWebRequest(key, endpoint, params, onFinish, onFail, opts);
}
export function klingV16I2v(
  key: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const endpoint = "/v3/async/kling-v1.6-i2v";
  novitaAPIWebRequest(key, endpoint, params, onFinish, onFail, opts);
}
export function minimaxVideo01(
  key: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const endpoint = "/v3/async/minimax-video-01";
  novitaAPIWebRequest(key, endpoint, params, onFinish, onFail, opts);
}
export function minimaxHailuo02(
  key: string,
  params: Record<string, any>,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const endpoint = "/v3/async/minimax-hailuo-02";
  novitaAPIWebRequest(key, endpoint, params, onFinish, onFail, opts);
}
export function hunyuanVideoFast(
  key: string,
  params: HunyuanVideoFastRequest,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const novitaClient = new NovitaSDKV3(key);
  novitaClient.setBaseUrl(BASE_API_URL);
  novitaClient
    .hunyuanVideoFast(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onFinish(res.task_id);
      } else {
        onFail(-1, "no task id");
      }
    })
    .catch((err) => {
      console.error("hunyuanVideoFast request error:", err);
      onFail(err.code, err.reason, err.msg);
    });
}
export function textToVideo(
  key: string,
  params: Txt2VideoRequest,
  onFinish: (taskId: string) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  novitaClient.setNovitaKey(key);
  novitaClient
    .txt2Video(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onFinish(res.task_id);
      } else {
        onFail(-1, "no task id");
      }
    })
    .catch((err) => {
      console.error("txt2video error:", err);
      onFail(err.code, err.reason, err.msg);
    });
}
export function imageToVideoWithProgress(
  key: string,
  params: Img2VideoRequest,
  onProgress: () => void,
  onFinish: (
    videoUrls: string[],
    info?: string,
    extra?: Record<string, any>,
  ) => void,
  onFail: (code: number, reason?: string, msg?: string) => void,
  syncTaskId: (taskId: string) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  novitaClient.setNovitaKey(key);
  novitaClient
    .img2Video(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        syncTaskId(res.task_id);
        let timer: NodeJS.Timeout | null = null;
        const checker = () => {
          checkProgressV3(key, res.task_id, opts, {
            onQueue: () => {
              timer = setTimeout(checker, 1000);
            },
            onProgress: () => {
              onProgress();
              timer = setTimeout(checker, 1000);
            },
            onFinish: (
              urls: string[],
              info?: string,
              extra?: Record<string, any>,
            ) => {
              onFinish(urls, info, extra);
            },
            onFail: (code: number, reason?: string) => {
              if (
                !(code === ResponseCodeV3.NETWORK && reason === "ERR_NETWORK")
              ) {
                onFail(code, reason || "");
              }
            },
          });
        };
        timer = setTimeout(checker, 1000);
        if (opts && opts.abortSignal) {
          opts.abortSignal.addEventListener("abort", () => {
            timer && clearTimeout(timer);
          });
        }
      } else {
        onFail(-1, "", "no task id");
      }
    })
    .catch((err: NovitaError) => {
      console.error("img2video error:", err);
      onFail(err.code, err.reason, err.msg);
    });
}
export function removeWatermark(
  key: string,
  params: any,
  onFinish: (url: string, taskId?: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return;
}
export function imageToVideoMotion(
  key: string,
  params: Img2VideoMotionRequest,
  onFinish: (taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  novitaClient.setNovitaKey(key);
  novitaClient
    .img2VideoMotion(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onFinish(res.task_id);
      } else {
        onFail(-1, "no task id");
      }
    })
    .catch((err) => {
      console.error("img2video-motion error:", err);
      onFail(err.code, err.reason, err.msg, (err as any)?.metadata?.task_id);
    });
}
export function animateAnyone(
  key: string,
  params: any,
  onFinish: (taskId: string) => void,
  onFail: (
    code: number,
    reason?: string,
    msg?: string,
    taskId?: string,
  ) => void,
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  return;
}
export function upload(
  data: Blob,
  type: "image" | "video",
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
) {
  return novitaClient
    .upload(
      { data, type },
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      return res.assets_id;
    })
    .catch((err) => {
      console.error("img2img error:", err);
      throw err;
    });
}
export function txt2SpeechFetch(params: {
  voice_id: string;
  language: string;
  texts: string;
  key: string;
}) {
  return request({
    url: "/v3/async/txt2speech",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      request: {
        voice_id: params.voice_id,
        language: params.language,
        texts: params.texts?.split("\n"),
      },
    },
    headers: {
      Authorization: "Bearer " + params.key,
    },
  });
}
export function apiProgress(task_id: string, key: string) {
  return request({
    url: "/v3/async/task-result",
    base_url: BASE_API_URL,
    query: {
      task_id,
    },
    headers: {
      Authorization: "Bearer " + key,
    },
  });
}
export function inpaintingWithProgress(
  key: string,
  params: InpaintingRequest,
  callbacks: {
    onFinish: (
      imgUrls: string[],
      info?: string,
      extra?: Record<string, any>,
    ) => void;
    onProgress: (imgUrls: string[]) => void;
    onFail: (code: number, reason: string, msg?: string) => void;
    onSubmitTaskSuccess: (taskId: string) => void;
  },
  opts?: {
    abortSignal?: AbortSignal;
    source?: string;
  },
): void {
  const { onFinish, onProgress, onFail, onSubmitTaskSuccess } = callbacks;
  novitaClient.setNovitaKey(key);
  novitaClient
    .inpainting(
      params,
      opts && { signal: opts.abortSignal, source: opts.source },
    )
    .then((res) => {
      if (opts?.abortSignal?.aborted) {
        return;
      }
      if (res && res.task_id) {
        onSubmitTaskSuccess(res.task_id);
        let timer: NodeJS.Timeout | null = null;
        const checker = () => {
          checkProgressV3(key, res.task_id, opts, {
            onQueue: () => {
              timer = setTimeout(checker, 1000);
            },
            onProgress: (imgUrls: string[]) => {
              onProgress(imgUrls);
              timer = setTimeout(checker, 1000);
            },
            onFinish: (
              urls: string[],
              info?: string,
              extra?: Record<string, any>,
            ) => {
              onFinish(urls, info, extra);
            },
            onFail: (code: number, reason?: string) => {
              if (
                !(code === ResponseCodeV3.NETWORK && reason === "ERR_NETWORK")
              ) {
                onFail(code, reason || "");
              }
            },
          });
        };
        timer = setTimeout(checker, 1000);
        if (opts && opts.abortSignal) {
          opts.abortSignal.addEventListener("abort", () => {
            timer && clearTimeout(timer);
          });
        }
      } else {
        onFail(-1, "task failed");
      }
    })
    .catch((err) => {
      console.error("animate anyone error:", err);
      onFail(err.code, err.reason, err.msg);
    });
}
