const mockReportError = jest.fn();
jest.mock("@/lib/utils/reporter", () => ({
  reportError: (...a: unknown[]) => mockReportError(...a),
}));

import { challengeCaptcha } from "@/lib/utils/captcha";

type CaptchaWin = Window & {
  TencentCaptcha?: jest.Mock;
};

describe("challengeCaptcha", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolves with the captcha result when the user completes it", async () => {
    const showMock = jest.fn();
    (window as CaptchaWin).TencentCaptcha = jest
      .fn()
      .mockImplementation((_appId: string, cb: (res: unknown) => void) => {
        // Simulate the user completing the captcha asynchronously
        setTimeout(() => cb({ ret: 0, ticket: "tk" }), 0);
        return { show: showMock };
      });

    const result = await challengeCaptcha();
    expect(result).toEqual({ ret: 0, ticket: "tk" });
    expect(showMock).toHaveBeenCalled();
  });

  it("rejects and reports an error when the captcha constructor throws", async () => {
    (window as CaptchaWin).TencentCaptcha = jest.fn().mockImplementation(() => {
      throw new Error("captcha boom");
    });

    await expect(challengeCaptcha()).rejects.toThrow("captcha boom");
    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({ errorNo: "TencentCaptcha_show_failed" }),
    );
  });
});
