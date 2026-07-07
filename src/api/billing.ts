import { request } from "./api";

export type NoticeMethod = "sms";

export type BalanceWarning = {
  threshold: number;
  notification_methods: Array<NoticeMethod>;
  state: boolean;
  notificationMembers?: string[];
  id?: number;
};

export function GetBalanceWarning(): Promise<{
  warnings: BalanceWarning[];
}> {
  return request({
    url: "/v1/billing/balance/warning",
    method: "GET",
  });
}

export function addBlanceWarning(
  data: BalanceWarning & {
    id: number;
  },
): Promise<unknown> {
  return request({
    url: "/v1/billing/balance/warning",
    method: "POST",
    data,
  });
}

export function updateBlanceWarning(
  data: BalanceWarning & {
    id: number;
  },
): Promise<unknown> {
  return request({
    url: "/v1/billing/balance/warning",
    method: "PUT",
    data,
  });
}

export function deleteBlanceWarning(id: number): Promise<unknown> {
  return request({
    url: "/v1/billing/balance/warning",
    method: "DELETE",
    data: {
      id,
    },
  });
}

export type PaymentMethod = "AliPay" | "WeixinPay" | "PublicRemittance";

export function billingForUser(data: {
  paymentMethod: string;
  rechargeAmount: number;
}): Promise<{ orderNo: string }> {
  return request({
    url: "/v1/billing/recharge",
    method: "POST",
    data,
  });
}

export type OrderStatus =
  | "pending"
  | "success"
  | "failed"
  | "expired"
  | "refund";

export type OrderStatusResponse = {
  state: OrderStatus;
  orderNo: string;
  codeURL: string;
  expiredTime: string;
  rechargeAmount: string;
};

export function getOrderStatus(params: {
  orderNo: string;
  isPay?: boolean;
}): Promise<OrderStatusResponse> {
  return request({
    url: "/v1/billing/order-status",
    method: "GET",
    query: {
      ...params,
    },
  });
}

import { MultimodalPricing } from "@/types/models";

export interface Bill {
  requestCount: number;
  userID: string;
  startTime: number;
  endTime: number;
  productName: string;
  category: string;
  ownerID: string;
  billNum0: number;
  billNum?: number | string;
  billNum1: number;
  billNum2: number;
  billNum3: number;
  billNum4: number;
  billNum5?: number; // TextInputTokens
  billNum6?: number; // TextOutputTokens
  billNum7?: number; // ImageInputTokens
  billNum8?: number; // ImageOutputTokens
  billNum9?: number; // AudioInputTokens
  billNum10?: number; // AudioOutputTokens
  billNum11?: number; // VideoInputTokens
  billNum12?: number; // VideoOutputTokens
  billNumUnit?: string;
  originAmount?: number;
  originAmountDecimal?: string;
  billingMethod: 1 | 2 | 5 | 7;
  basePrice0: number;
  basePrice1: number;
  basePrice2: number;
  basePrice3: number;
  basePrice4: number;
  basePrice5: number;
  discountPrice0: number;
  discountPrice1: number;
  discountPrice2: number;
  discountPrice3: number;
  discountPrice4: number;
  discountPrice5: number;
  pricePrecision: number;
  amount: number;
  amountDecimal?: string;
  voucherAmount: number;
  voucherAmountDecimal?: string;
  payAmount: number;
  payableDecimal?: string;
  payAmountDisplay: string;
  productId: string;
  llmSeries: string;
  committedUsage: number;
  tieredConfig: {
    maxTokens: string;
    minTokens: string;
    outputMinTokens?: string;
    outputMaxTokens?: string;
  } | null;
  multimodalPricing?: MultimodalPricing | null;
}

export interface BillByMember {
  userId: string;
  memberId: string;
  startTime: number;
  endTime: number;
  productName: string;
  amount: number;
  amountDecimal?: string;
  voucherAmount: number;
  voucherAmountDecimal?: string;
  payAmount: number;
  payableDecimal?: string;
}

export type GetBillListParams = {
  cycleType: string;
  productCategory:
    | "summary"
    | "llm"
    | "gen_api"
    | "gpu"
    | "serverless"
    | "cloud_storage"
    | "image"
    | "llm_dedicated_endpoint"
    | "cloud_sandbox"
    | "token_saving_plan";
  category?: string;
  startTime: string;
  endTime: string;
  productName?: string;
  ownerId?: string;
};

export type GetBillListByMemberParams = {
  cycleType: string;
  startTime: string;
  endTime: string;
};

export function getBillList(
  query: GetBillListParams,
  signal?: AbortSignal,
): Promise<{ bills: Bill[] }> {
  return request({
    url: "/v1/billing/bill/list",
    method: "GET",
    query,
    signal,
  });
}

export function getBillListByAPIKey(
  query: any,
  signal?: AbortSignal,
): Promise<{ bills: any[] }> {
  const queryParams = {
    ...query,
  };
  delete queryParams.productCategory;
  return request({
    url: "/v1/billing/apikey/bill/list",
    method: "GET",
    query: queryParams,
    signal,
  });
}

export function getBillListMonthly(
  query: GetBillListParams,
  signal?: AbortSignal,
): Promise<{ bills: Bill[] }> {
  return request({
    url: "/v1/billing/bill/monthly/list",
    method: "GET",
    query,
    signal,
  });
}

export function getBillListByMember(
  query: GetBillListByMemberParams,
  signal?: AbortSignal,
): Promise<{ bills: BillByMember[] }> {
  return request({
    url: "/v1/billing/member/bill/list",
    method: "GET",
    query,
    signal,
  });
}

export function getBillCategory(query: {
  productCategory: "summary" | "llm" | "gpu" | "serverless" | "cloud_storage";
}): Promise<{ data: string[] }> {
  return request({
    url: "/v1/billing/bill/category",
    method: "GET",
    query,
  });
}

export function queryBillingInfo(): Promise<
  Record<string, string | number | boolean>
> {
  return request({
    url: "/v1/billing/info",
    method: "GET",
  });
}

export function getEnterpriseBillList(
  query: GetBillListParams,
  signal?: AbortSignal,
): Promise<{ bills: Bill[] }> {
  return request({
    url: "/v1/billing/enterprise/bill/list",
    method: "GET",
    query,
    signal,
  });
}

export function getBalanceDetail(): Promise<BalanceDetailType> {
  return request({
    url: "/v1/billing/balance/detail",
    method: "GET",
  });
}

export function getMonthlyBill(): Promise<{ data: MonthlyBillType[] }> {
  return request({
    url: "/v1/billing/monthly/bill",
    method: "GET",
  });
}
