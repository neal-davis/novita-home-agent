import { request } from "./api";

export function createProductSession({
  price,
  client_id,
  campaign,
  redirect_url,
}: {
  price: number;
  redirect_url: string;
  client_id?: string;
  campaign?: string;
}) {
  return request({
    url: "/v2/stripe/create-checkout-session",
    method: "POST",
    data: {
      price,
      client_id,
      campaign,
      redirect_url,
    },
    ignoreMsg: true,
  });
}

export function createCheckoutSessionV3({
  price,
  redirect_url,
}: {
  price: number;
  redirect_url: string;
}): Promise<{ sessionUrl: string }> {
  return request({
    url: "/v3/stripe/create-checkout-session",
    method: "POST",
    data: {
      price,
      redirect_url,
    },
    ignoreMsg: true,
  });
}

export interface doTransactionRequest {
  merchantTxnId?: string;
  merchantTxnTimeZone?: string;
  orderAmount: string;
  txnOrderMsg: {
    javaEnabled: boolean;
    colorDepth: string;
    screenHeight: string;
    screenWidth: string;
    timeZoneOffset: string;
    userAgent: string;
    language: string;
    transactionIp?: string;
    accept?: string;
    contentLength?: string;
  };
  billingInformation: {
    email: string;
    country: string;
  };
  shippingInformation: {
    email: string;
    country: string;
  };
}

export function doTransaction(params: doTransactionRequest) {
  return request({
    url: "/v1/order/doTransaction",
    method: "POST",
    data: {
      ...params,
    },
  });
}

export function orderList({
  inputs,
  pageIndex,
  pageSize,
  status,
  startTime,
  endTime,
  orderType,
  channel,
}: {
  inputs: string;
  pageIndex: number;
  pageSize: number;
  status?: string;
  startTime?: string;
  endTime?: string;
  orderType?: "refund" | "recharge";
  channel?: string;
}) {
  const query = {
    inputs,
    pageIndex,
    pageSize,
    source: 1,
    status,
    startTime,
    endTime,
    orderType,
    channel,
  };

  const filteredQuery = Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined),
  );

  return request({
    url: "/v1/user/order",
    query: filteredQuery,
  });
}

export function getPaymentMethod() {
  return request({
    url: "/v3/stripe/paymentMethods",
    ignoreMsg: true,
  });
}

export function bindPaymentMethod({ redirect_url }: { redirect_url: string }) {
  return request({
    url: "/v3/stripe/paymentMethod",
    method: "POST",
    data: {
      redirect_url,
    },
  });
}

export function unbindPaymentMethod({
  paymentMethodId,
}: {
  paymentMethodId: string;
}) {
  return request({
    url: "/v3/stripe/paymentMethod",
    method: "DELETE",
    query: {
      paymentMethodId,
    },
  });
}

export function setAutoRecharge({
  threshold,
  amount,
  isAutoRecharge,
}: {
  threshold: number;
  amount: number;
  isAutoRecharge: boolean;
}) {
  return request({
    url: "/v3/stripe/autoRecharge",
    method: "POST",
    data: {
      threshold,
      amount,
      isAutoRecharge,
    },
  });
}

export function getAutoRecharge() {
  return request({
    url: "/v3/stripe/autoRecharge",
  });
}

export function topUp({
  amount,
  paymentMethodId,
  campaign,
}: {
  amount: number;
  paymentMethodId: string;
  campaign?: string;
}) {
  return request({
    url: "/v3/stripe/topup",
    method: "POST",
    data: {
      amount,
      paymentMethodId,
      campaign,
    },
    ignoreMsg: true,
  });
}

export function getTopUpStatus(topUpId: string) {
  return request({
    url: "/v3/stripe/topup",
    query: {
      topUpId,
    },
  });
}

export function updateStripeCustomerPortal({
  redirect_url,
}: {
  redirect_url: string;
}) {
  return request({
    url: "/v3/stripe/customer-portal",
    method: "POST",
    data: {
      redirect_url,
    },
  });
}

export function queryBillingGetVoucherNum(businessType?: IBusinessType) {
  const payload: { businessType?: string } = {};
  if (businessType) {
    payload.businessType = businessType;
  }
  return request({
    url: "/v1/billing/voucher/num",
    query: payload,
  });
}

export function queryBillingGetTotalBalance() {
  return request({
    url: "/v1/billing/balance/total",
  });
}

export function getStripeInvoiceUrl(
  oid: string,
): Promise<{ invoiceUrl: string }> {
  return request({
    url: "/v3/stripe/order/invoice-url",
    query: { oid },
  });
}
