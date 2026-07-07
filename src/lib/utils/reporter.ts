const isProd = process.env.NEXT_PUBLIC_ENV === "prod";
const prefix = isProd ? "https://log-reporter" : "https://dev-api";
const baseUrl = `${prefix}.${"novita.ai"}/v1/frontend-log/report`;
/**
 * Report errors to logging server
 * @param {Object} params - Error reporting parameters
 * @param {string} params.errorNo - Error identifier, try to be unique, used for error statistics
 * @param {string} params.errorInfo - Detailed error information
 * @param {0|1|2|3} params.level - Error severity level
 * @param {'request'|'other'} params.type - Error type
 */
export function reportError({
  errorNo,
  errorInfo,
  level,
  type,
}: {
  errorNo: string;
  errorInfo: string;
  level: 0 | 1 | 2 | 3;
  type: "request" | "other";
}) {
  fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      errorno: errorNo,
      stack: `P${level}_${"NOVITA_ERROR"}_${type}_${errorInfo}`.slice(0, 500),
      page:
        typeof window !== "undefined" ? window.location.href : "server_side",
    }),
  })
    .then(() => {})
    .catch((error) => {
      console.log("report error: ", error);
    });
}
