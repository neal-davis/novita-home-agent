export function getUTMParams(
  url: string = window.location.href,
): Record<string, string> {
  const urlObject = new URL(url);

  const params = new URLSearchParams(urlObject.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  utmKeys.forEach((key) => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}
