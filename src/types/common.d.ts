interface Window {
  [prop: string]: any;
  __MONITOR__: {
    add: (errorReport: ErrorReport) => void;
  };
}

interface ErrorReport {
  error_type: string;
  lineNumber: string;
  stack: string;
  message: string;
  context: string;
  user_id: string;
  page: string;
  errorno: string;
  caller: string;
}

declare module "fake-progress";

declare module "@tapfiliate/tapfiliate-js";

interface APICommonErrorResponse {
  code: number;
  reason: string;
  message?: string;
  metadata?: Record<string, any>;
}
