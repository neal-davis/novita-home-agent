import { request, service_base_url } from "../api";
const BASE_API_URL = service_base_url + "/api/v1";
const BASE_API_URL_NOAPI = service_base_url + "/v1";

// topup stripe
export function reqRecharge(params: any) {
  return request({
    url: "/wallet/recharge",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}

export function reqBalanceTotal(params: any) {
  return request({
    url: "/billing/balance/total",
    method: "GET",
    base_url: BASE_API_URL_NOAPI,
    query: params
  });
}
export function reqWalletOrder(params: any) {
  return request({
    url: "/wallet/order",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqWalletTransaction(params: any) {
  return request({
    url: "/wallet/transaction",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
// Send Receipt
export function reqSendReceipt(params: any) {
  return request({
    url: "/wallet/send_invoice",
    method: "POST",
    base_url: BASE_API_URL,
    data: {
      ...params,
    },
  });
}
export function reqMyWallet(params: any) {
  return request({
    url: "/wallet",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqMyVoucherList(params: any) {
  return request({
    url: "/voucher/list",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqWalletBilling(params: any) {
  return request({
    url: "/wallet/statistic/billing",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}
export function reqWalletInnerBilling(params: any) {
  return request({
    url: "/wallet/billing",
    method: "GET",
    base_url: BASE_API_URL,
    query: params
  });
}