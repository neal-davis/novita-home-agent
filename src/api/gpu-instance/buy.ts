import { request } from "../api";

export function createProductSession({
  price,
  client_id,
  campaign,
}: {
  price: number;
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

export function orderList(inputs: string, pageIndex: number, pageSize: number) {
  return request({
    url: "/v1/user/order?",
    query: {
      inputs,
      pageIndex,
      pageSize,
      source: 1,
    },
  });
}

export function getPaymentMethod() {
  return request({
    url: "/v3/stripe/paymentMethods",
  });
}

export function bindPaymentMethod() {
  return request({
    url: "/v3/stripe/paymentMethod",
    method: "POST",
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
