import { renderHook, waitFor } from "@testing-library/react";
import { useOauth } from "@/hooks/useOauth";

const mockGithubLogin = jest.fn();
const mockGoogleLogin = jest.fn();
const mockBindGithub = jest.fn();
const mockHandleLoginSuccessCb = jest.fn();
const mockGetUserCollect = jest.fn(() => ({ browser: "Chrome" }));
const mockGetRegistrationCampaignCode = jest.fn();
const mockDispatch = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockSearchParams = {
  get: jest.fn(),
};
let mockPathname = "/models";
let mockUuid = "";

jest.mock("@/api/user", () => ({
  GithubLogin: (...args: unknown[]) => mockGithubLogin(...args),
  GoogleLogin: (...args: unknown[]) => mockGoogleLogin(...args),
  bindGithub: (...args: unknown[]) => mockBindGithub(...args),
}));

jest.mock("@/lib/utils/user", () => ({
  handleLoginSuccessCb: (...args: unknown[]) =>
    mockHandleLoginSuccessCb(...args),
}));

jest.mock("@/lib/utils/utils", () => ({
  getUserCollect: () => mockGetUserCollect(),
}));

jest.mock("@/lib/utils/registrationCampaign", () => ({
  getRegistrationCampaignCode: () => mockGetRegistrationCampaignCode(),
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) =>
    selector({
      user: {
        uuid: mockUuid,
      },
    }),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

describe("useOauth", () => {
  const beforeFetchCb = jest.fn();
  const successCb = jest.fn();
  const errorCb = jest.fn();
  const finallyCb = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockPathname = "/models";
    mockUuid = "";
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "code") return "oauth-code";
      if (key === "scope") return null;
      return null;
    });
    mockGetRegistrationCampaignCode.mockReturnValue("campaign-code");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        origin: "https://novita.ai",
        reload: jest.fn(),
      },
    });
  });

  function renderOauth() {
    return renderHook(() =>
      useOauth({
        beforeFetchCb,
        errorCb,
        finallyCb,
        successCb,
      }),
    );
  }

  it("runs Google login from scoped OAuth params and handles token success", async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "code") return "google-code";
      if (key === "scope") return "profile google email";
      return null;
    });
    localStorage.setItem("sign_up_from", "hero");
    localStorage.setItem("invited_code", "invite-code");
    mockGoogleLogin.mockResolvedValue({ token: "token-1" });

    renderOauth();

    await waitFor(() =>
      expect(mockGoogleLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          browser: "Chrome",
          code: "google-code",
          fromInviteCode: "campaign-code",
          redirectUrl: "https://novita.ai/models",
          sign_up_from: "hero",
        }),
      ),
    );
    expect(beforeFetchCb).toHaveBeenCalled();
    expect(mockHandleLoginSuccessCb).toHaveBeenCalledWith(
      expect.objectContaining({
        dispatch: mockDispatch,
        pathname: "/models",
        response: { token: "token-1" },
      }),
    );
    expect(successCb).toHaveBeenCalled();
    expect(finallyCb).toHaveBeenCalled();
    expect(localStorage.getItem("invited_code")).toBeNull();
  });

  it("runs Github login and forwards the login success callback", async () => {
    mockGithubLogin.mockResolvedValue({ token: "github-token" });
    mockGetRegistrationCampaignCode.mockReturnValue("");
    localStorage.setItem("invited_code", "affiliate-code");

    renderOauth();

    await waitFor(() =>
      expect(mockGithubLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          browser: "Chrome",
          code: "oauth-code",
          fromInviteCode: "affiliate-code",
        }),
      ),
    );
    await waitFor(() =>
      expect(mockHandleLoginSuccessCb).toHaveBeenCalledWith(
        expect.objectContaining({
          response: { token: "github-token" },
        }),
      ),
    );
    expect(successCb).toHaveBeenCalled();
    expect(finallyCb).toHaveBeenCalled();
  });

  it("clears the URL and calls error/finally callbacks when Google login fails", async () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "code") return "google-code";
      if (key === "scope") return "google";
      return null;
    });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockGoogleLogin.mockRejectedValue(new Error("login failed"));

    renderOauth();

    await waitFor(() => expect(errorCb).toHaveBeenCalled());
    expect(mockReplace).toHaveBeenCalledWith("/models");
    expect(finallyCb).toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it("does nothing when there is no OAuth code", () => {
    mockSearchParams.get.mockReturnValue(null);

    renderOauth();

    expect(beforeFetchCb).not.toHaveBeenCalled();
    expect(mockGithubLogin).not.toHaveBeenCalled();
    expect(mockGoogleLogin).not.toHaveBeenCalled();
  });
});
