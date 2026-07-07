import { reportError } from "@/lib/utils/reporter";

const CAPTCHA_APP_ID = "199598093";

export function challengeCaptcha(): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const captcha = new window.TencentCaptcha(
        CAPTCHA_APP_ID,
        (res: any) => resolve(res),
        {
          userLanguage: "zh-cn",
        },
      );
      captcha.show();
    } catch (error) {
      reportError({
        errorNo: "TencentCaptcha_show_failed",
        errorInfo: error ? JSON.stringify(error) : "",
        level: 0,
        type: "other",
      });
      reject(error);
    }
  });
}
