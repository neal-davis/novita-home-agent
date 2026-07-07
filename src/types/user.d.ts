type userUpdateSchema = {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  country?: string;
};

type consumeMonthlySchema = {
  month: string;
  model_api: string;
  gpu_instance: string;
  serverless: string;
  storage: string;
  cloud_sandbox: string;
  llm_dedicated_endpoint: string;
}[];

type Campaign = {
  campaignSlug: string;
  campaignCode: string;
  beginTime: number;
  expiryTime: number;
  logo?: string;
  title?: string;
  description: string;
};
