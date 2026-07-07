import { request } from "./api";
import { ENTERPRISE_PLAYGROUND_CONFIG } from "@/constants/constants";

export type SubmissionEnterprisePlanRequest = {
  plan_id: number | string;
  company_size: string;
  case: string;
  email: string;
};

export type EnterprisePlanConfig = {
  customer?: string;
  task_worker_pool_max_workers?: number;
  task_schedule_timeout?: any;
  from_enterprise_plan?: boolean;
  max_queue_size?: number;
  allowed_checkpoints?: string[];
  allowed_embeddings?: string[];
};

export type EnterprisePlanRecord = {
  uid: number;
  uuid: string;
  plan_name: string;
  price: number;
  currency: string;
  period: string;
  unit: string;
  renewal_at: number;
  payment_method_id: string;
  status: "Deploying" | "Actived" | "Suspended" | string;
  configuration: EnterprisePlanConfig;
  oid: string;
  is_cancel: boolean;
};

export function enterpriseProductList() {
  return request({
    url: "/v1/enterprise-plan/product",
  });
}

export function queryEnterpriseConfig() {
  return request({
    url: "/v1/enterprise-plan/config",
  });
}

export function queryEnterprisePlanSubmission() {
  return request({
    url: "/v1/enterprise-plan/submission",
  });
}

export function submissionEnterprisePlan(
  params: SubmissionEnterprisePlanRequest,
) {
  return request({
    url: "/v1/enterprise-plan/submission",
    method: "post",
    data: {
      ...params,
    },
  });
}

export function enterprisePlanDetail(query: { uuid: string }) {
  return request({
    url: "v1/enterprise-plan/info",
    query,
  });
}

export function enterprisePlanList() {
  return request({
    url: "/v1/enterprise-plan/product",
  });
}

export function payEnterprise({
  billingMethod,
  paymentMethodId,
  planId,
  campaign,
  count,
}: {
  billingMethod: number;
  paymentMethodId: string;
  planId: number;
  campaign?: string;
  count?: number;
}) {
  return request({
    url: "/v3/stripe/dedicated-endpoints",
    method: "POST",
    data: {
      paymentMethodId,
      planId,
      campaign,
      count,
      billingMethod,
    },
    ignoreMsg: true,
  });
}

export function queryEnterprisePlanRecord() {
  return request({
    url: "/v1/enterprise-plan/list",
  });
}

export function cancelEnterprisePlan({ uuid }: { uuid: string }) {
  return request({
    url: "/v1/enterprise-plan/cancel",
    method: "POST",
    data: {
      uuid,
    },
  });
}

export function querySubmission() {
  return request({
    url: "/v1/enterprise-plan/submission",
  });
}

export function couponCheck({
  plan_id,
  coupon_no,
}: {
  plan_id: number;
  coupon_no: string;
}) {
  return request({
    url: "/v1/enterprise-plan/coupon-check",
    method: "POST",
    data: {
      plan_id,
      coupon_no,
    },
  });
}

export function setPlaygroundConfig({
  playground_api_config,
}: {
  playground_api_config: ENTERPRISE_PLAYGROUND_CONFIG;
}) {
  return request({
    url: "/v1/enterprise-plan/playground",
    method: "PUT",
    data: {
      playground_api_config,
    },
    ignoreMsg: true,
  });
}

export function enterpriseCount() {
  return request({
    url: "/v1/enterprise-plan/count",
  });
}

export function enterpriseProductInfo() {
  return request({
    url: "/v1/enterprise-plan/product-list",
  });
}

export function updateEnterprisePlanBillingMethod({
  billingMethod,
}: {
  billingMethod: number;
}) {
  return request({
    url: "/v1/enterprise-plan/billing-method",
    method: "PUT",
    data: {
      billingMethod,
    },
  });
}
