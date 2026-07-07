import { STRAPI_BASE_URL } from "@/constants/urls";
import { request } from "./api";

export const STRAPI_PROXY_URL = "/api/config";

export async function getActivityConfig(): Promise<any> {
  return { isOn: true };
}

export function getServerlessAccessEmail({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) {
  const filterStr = `filters[$or][0][uuid][$eq]=${uuid}&filters[$or][1][email][$eq]=${email}`;
  return request({
    url: `${STRAPI_PROXY_URL}/serverless-accesses?${filterStr}`,
    base_url: "",
  })
    .then((result) => {
      const { data = [] } = result;
      return data.map((item: any) => {
        return item.attributes ?? item;
      });
    })
    .catch((error) => {
      console.error(`fetch serverless-access data error: `, error);
      return null;
    });
}

export function requestInstanceMarkEffect() {
  return request({
    url: `${STRAPI_PROXY_URL}/instance-mark-effects`,
    base_url: "",
  })
    .then((result) => {
      const { data = [] } = result;
      return data.map((item: any) => {
        return item.attributes ?? item;
      });
    })
    .catch((error) => {
      console.error(`fetch instance-mark-effects data error: `, error);
      return null;
    });
}

// only use in server side render
export function getGPUBannerConfigInServerEnv() {
  return fetch(`${STRAPI_BASE_URL}/gpu-banner-config`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 10,
    },
  })
    .then((res) => res.json())
    .then((result) => {
      const { data = {} } = result;
      const obj = data?.attributes ?? data;
      return obj?.data || [];
    })
    .catch((error) => {
      console.error(`fetch banner config error: `, error);
      return [];
    });
}

export function requestServerlessLimitsizeAccess({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) {
  const filterStr = `filters[$or][0][uuid][$eq]=${uuid}&filters[$or][1][email][$eq]=${email}`;
  return request({
    url: `${STRAPI_PROXY_URL}/serverless-limitsize-accesses?${filterStr}`,
    base_url: "",
  })
    .then((result) => {
      const { data = [] } = result;
      return data.map((item: any) => {
        return item.attributes ?? item;
      });
    })
    .catch((error) => {
      console.error(`fetch serverless-limitsize-accesses data error: `, error);
      return null;
    });
}

export function getServerlessAccess({
  mobilePhone,
  uuid,
}: {
  mobilePhone: string;
  uuid: string;
}) {
  const filterStr = `filters[$or][0][uuid][$eq]=${uuid}&filters[$or][1][mobilePhone][$eq]=${mobilePhone}`;
  return request({
    url: `${STRAPI_PROXY_URL}/serverless-accesses?${filterStr}`,
    base_url: "",
  })
    .then((result) => {
      const { data = [] } = result;
      return data.map((item: any) => {
        return item.attributes ?? item;
      });
    })
    .catch((error) => {
      console.error(`fetch serverless-access data error: `, error);
      return null;
    });
}

// only use in server side render
export function getLandingPageTemplatesInServerEnv() {
  return request({
    url: `${STRAPI_BASE_URL}/landing-page-templates`,
    base_url: "",
  })
    .then((result) => {
      const { data = [] } = result;
      return data.map((item: any) => {
        return item.attributes ?? item;
      });
    })
    .catch((error) => {
      console.error(`fetch landing-page-templates data error: `, error);
      return null;
    });
}

// only use in server side render
export async function getNoticeConfigInServerEnv(
  hideNoticeUpdateTime: number,
): Promise<any> {
  return fetch(`${STRAPI_BASE_URL}/notice`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 300,
    },
  })
    .then((res) => res.json())
    .then((result) => {
      const { data } = result;
      const obj = data?.attributes ?? data;
      const updatedAt = obj?.updatedAt;
      if (updatedAt && hideNoticeUpdateTime) {
        const updateTime = new Date(updatedAt).getTime();
        if (updateTime <= hideNoticeUpdateTime) {
          return {
            show: false,
            name: "",
            content: "",
            url: "",
          };
        }
      }
      return obj || {};
    })
    .catch((error) => {
      console.error(`fetch notice data error: `, error);
      return {};
    });
}

// only use in server side render
export function getBannerConfigInServerEnv() {
  return fetch(`${STRAPI_BASE_URL}/banner-config`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 10,
    },
  })
    .then((res) => res.json())
    .then((result) => {
      const { data = {} } = result;
      const obj = data?.attributes ?? data;
      return obj?.data || [];
    })
    .catch((error) => {
      console.error(`fetch banner config error: `, error);
      return [];
    });
}

// only use in server side render
export function getBuildWithConfigInServerEnv() {
  return fetch(`${STRAPI_BASE_URL}/buildwith-config`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 10,
    },
  })
    .then((res) => res.json())
    .then((result) => {
      const { data = {} } = result;
      const obj = data?.attributes ?? data;
      return obj?.data || [];
    })
    .catch((error) => {
      console.error(`fetch buildwith-config error: `, error);
      return [];
    });
}

// only use in server side render
export function getCampaignConfigInServerEnv() {
  return fetch(`${STRAPI_BASE_URL}/campaign-config`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 10,
    },
  })
    .then((res) => res.json())
    .then((result) => {
      const { data = {} } = result;
      const obj = data?.attributes ?? data;
      return obj?.data || {};
    })
    .catch((error) => {
      console.error(`fetch campaign config error: `, error);
      return {};
    });
}

// only use in server side render
export function getLLMModelReadMeInServerEnv(modelId: string) {
  const fetchUrl = `${STRAPI_BASE_URL}/llm-model-readmes?filters[modelId][$contains]=${modelId}`;
  console.log("fetch LLM Model ReadMe URL", fetchUrl);
  return fetch(fetchUrl)
    .then((res) => res.json())
    .then((result) => {
      const { data = [] } = result;
      return data.map((item: any) => {
        return item.attributes ?? item;
      });
    })
    .catch((error) => {
      console.error(`fetch llm-model-readmes data error: `, error);
      return [];
    });
}

export function getRegistrationCampaignConfigInServerEnv() {
  return request({
    url: "/v1/activity/referral-configs",
  })
    .then((res) => {
      return res.configs;
    })
    .catch((error) => {
      console.error(`fetch referral-configs data error: `, error);
      return [];
    });
}

// get llm api markdown
export async function getLLMApiMarkdown() {
  return Promise.all([
    fetch("/product-llm/llm-http.md", { next: { revalidate: 300 } }).then(
      (res) => res.text(),
    ),
    fetch("/product-llm/llm-nodejs.md", { next: { revalidate: 300 } }).then(
      (res) => res.text(),
    ),
    fetch("/product-llm/llm-python.md", { next: { revalidate: 300 } }).then(
      (res) => res.text(),
    ),
  ]);
}

export function reportInternalEvent(data: {
  uid: string;
  action: "LOGIN" | "BOOK_DEMO" | "PAGE_VIEW_PRICING";
}) {
  return request({
    base_url: "",
    url: `/api/report`,
    method: "POST",
    data: data,
  });
}

export function getLLMVendors(): Promise<
  Array<{
    name: string;
    value: string;
    icon: string | null;
  }>
> {
  return fetch(`${STRAPI_BASE_URL}/llm-vendors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 300,
    },
  })
    .then((res) => res.json())
    .then((result) => {
      const { data = [] } = result;
      return data
        .map((item: any) => {
          const one = item.attributes || item;
          return one.internal
            ? null
            : {
                name: one.name,
                value: one.value,
                icon: one.icon,
              };
        })
        .filter(Boolean);
    })
    .catch((error) => {
      console.error(`fetch llm-vendors data error: `, error);
      return [];
    });
}

export type AutopaymentConfig = Record<
  string,
  {
    max_amount: number;
    max_threshold: number;
  }
>;

export async function getAutopaymentConfigInServerEnv(): Promise<AutopaymentConfig> {
  return fetch(`${STRAPI_BASE_URL}/autopayment-config`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 300,
    },
  })
    .then((res) => res.json())
    .then((result) => {
      const { data = {} } = result;
      const obj = data?.attributes ?? data;
      return obj?.config || {};
    })
    .catch((error) => {
      console.error(`fetch banner config error: `, error);
      return {};
    });
}
