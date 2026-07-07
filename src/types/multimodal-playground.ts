export enum TaskStatus {
  QUEUED = "TASK_STATUS_QUEUED",
  PROCESSING = "TASK_STATUS_PROCESSING",
  SUCCEED = "TASK_STATUS_SUCCEED",
  FAILED = "TASK_STATUS_FAILED",
}

export interface TaskResultResponse {
  task: {
    status: TaskStatus;
    reason?: string;
    progress_percent: number;
  };
  images?: Array<{ image_url: string }>;
  videos?: Array<{ video_url: string }>;
  audios?: Array<{ audio_url: string }>;
  extra?: Record<string, any>;
}

export type MultimodalTaskResult = TaskResultResponse | Blob;

export enum ResponseCodeV3 {
  NETWORK = -10,
  CANCELED = -11,
  OK = 200,
  TOO_MANY_REQ = 429,
  INTERNAL_ERR = 500,
  REQUEST_INVALID = 400,
}

export enum APIErrReasonV3 {
  ANONYMOUS_ACCESS_QUOTA_EXCEEDS = "ANONYMOUS_ACCESS_QUOTA_EXCEEDS",
  BILLING_FAILED = "BILLING_FAILED",
  BILLING_AUTH_FAILED = "BILLING_AUTH_FAILED",
  BALANCE_NOT_ENOUGH = "BILLING_BALANCE_NOT_ENOUGH",
  INVALID_REQUEST_BODY = "INVALID_REQUEST_BODY",
  ERR_NETWORK = "ERR_NETWORK",
}

export interface SchemaProperty {
  type: string;
  description?: string;
  example?: any;
  default?: any;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  items?: any;
  required?: string[];
  properties?: Record<string, SchemaProperty>;
  enum?: any[];
}
export interface RawOpenAPISchema {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, Record<string, any>>;
  components: {
    schemas: {
      [key: string]: {
        required: string[];
        properties: Record<string, SchemaProperty>;
      };
    };
  };
}

export interface ParsedOpenAPISchema {
  endpoint: string;
  method: string;
  description?: string;
  requiredFields: string[];
  requestSchema: Record<string, SchemaProperty>;
}

export interface MultimodalListItem {
  fusionConfig: {
    name: string;
    displayName: string;
    description?: string;
    labels?: { key: string; value: string }[];
    series?: string;
    examples?: string;
    markdown?: string;
    modelReleasedAt?: string | number | null;
    platformReleaseAt?: string | number | null;
  };
  modelConfig: {
    config: {
      async: boolean;
      openapiSchema: string;
      category: "image_gen" | "audio_gen" | "video_gen";
    };
  };
}

export interface MultimodalDetail {
  name: string;
  displayName: string;
  description?: string;
  category: "image_gen" | "audio_gen" | "video_gen";
  openapiSchema: RawOpenAPISchema;
  examples?: {
    request: Record<string, any>;
    response: Record<string, any>;
  }[];
  markdown?: string;
  async: boolean;
}
