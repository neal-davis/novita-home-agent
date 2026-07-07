import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";

export function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  return request({
    url: "/v1/user/login",
    method: "POST",
    data: {
      email,
      password,
    },
  });
}

export function GoogleLogin(params: any) {
  return request({
    url: "/v1/user/googleAuth",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function GithubLogin(params: any) {
  return request({
    url: "/v2/user/githubAuth",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function register(params: {
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return request({
    url: "/v1/user/register",
    method: "POST",
    data: { ...params },
  });
}

export function info() {
  return request({
    url: "/v1/user/info",
    method: "GET",
  });
}

export function setResetPwdEmail(email: string) {
  return request({
    url: "/v1/user/pwd/reset/send?email=" + email,
  });
}

export function resetPwd(data: {
  email: string;
  password: string;
  confirmPassword: string;
  token: string;
}) {
  return request({
    url: "/v1/user/resetPwd",
    method: "POST",
    data,
  });
}

export function getPointInfo() {
  return request({
    url: "/v1/user/pointInfo",
  });
}

export function pointUsage() {
  return request({
    url: "/v1/user/pointUsage",
  });
}

export function modalCount() {
  return request({
    url: "/v1/user/modelCount",
  });
}

export function generateCoupon(params: {
  type: string;
  count?: number;
  point: number;
  day: number;
  limit?: number;
  node?: string;
}) {
  return request({
    url: "/v1/user/exchangeCode",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function activeCode(params: {
  code?: string;
  type?: string;
  url?: string;
  emails?: string[];
  note?: string;
  point?: number;
}) {
  return request({
    url: "/v1/user/exchangeCode/activate",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function userCollect(params: { occupation: string; category: string }) {
  return request({
    url: "/v1/user/fillCollectInfo",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function getCollectInfo() {
  return request({
    url: "/v1/user/checkCollectInfo",
  });
}

export function getConfig() {
  return request({
    url: "/v1/config",
  });
}

export function UserInfo(token: string) {
  return request({
    url: "/v3/user",
    base_url: BASE_API_URL,
    token,
  });
}

export function getModel(token: string, params: any) {
  return request({
    url: "/v3/model",
    query: {
      ...params,
    },
    token: token,
    base_url: BASE_API_URL,
  });
}

export function getUploadUrl(
  key: string,
  model_name: string,
  file_sha256: string,
  file_extension: string,
) {
  return request({
    url: "/v3/model/uploader",
    method: "POST",
    data: {
      model_name: model_name,
      file_sha256: file_sha256,
      file_extension: file_extension,
    },
    token: key,
    base_url: BASE_API_URL,
  });
}
export function getMeta(key: string) {
  return request({
    url: "/v3/metadata",
    token: key,
    base_url: BASE_API_URL,
  });
}

export function delModel(token: string, id: number) {
  return request({
    url: `/v3/model`,
    method: "DELETE",
    token: token,
    base_url: BASE_API_URL,
    query: {
      id: id,
    },
  });
}

export function getUSDTPaymentUrl() {
  return request({
    url: "/v1/user/getUSDTUrl",
    method: "POST",
    // base_url: "http://localhost:8000",
  });
}

export function queryUSDTPaymentByOid(oid: string) {
  return request({
    url: "/v1/user/queryUSDTOrderByOid",
    method: "GET",
    query: {
      oid: oid,
    },
    // base_url: "http://localhost:8000",
  });
}

export function queryApiUsage() {
  return request({
    url: "/v1/user/queryApiUsage",
  });
}

export function queryApiUsageByTime({
  start,
  end,
}: {
  start: string;
  end: string;
}) {
  return request({
    url: "/v1/user/queryApiUsageByTime",
    query: {
      start,
      end,
    },
  });
}

export function sendContactInfo(info: any) {
  return request({
    url: "/user/sale/contact",
    method: "POST",
    data: {
      ...info,
    },
    base_url: BASE_API_URL,
  });
}
