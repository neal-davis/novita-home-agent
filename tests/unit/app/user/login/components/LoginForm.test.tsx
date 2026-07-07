import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Cookies from "js-cookie";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { login } from "@/api/user";
import { message } from "@/components/ui/standard/notify";
import { LoginForm } from "@/app/user/login/components/LoginForm";
import { fetchTeamInvite } from "@/store/slice/userSlice";
import { handleLoginSuccessCb } from "@/lib/utils/user";
import {
  getRegistrationCampaign,
  isShowRegistrationCampaign,
  syncCampaignCodeForThirdPartyAuth,
} from "@/lib/utils/registrationCampaign";
import {
  githubLogin,
  googleLogin,
  huggingfaceLogin,
} from "@/app/user/components/third-part-login-button";
import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";

jest.mock("lodash/debounce", () => {
  return (fn: (...args: unknown[]) => unknown) => {
    const debounced = (...args: unknown[]) => fn(...args);
    debounced.cancel = jest.fn();
    return debounced;
  };
});

jest.mock("@/api/user", () => ({
  login: jest.fn(),
}));

jest.mock("@/lib/utils/utils", () => ({
  getUserCollect: jest.fn(() => ({ country: "US", userAgent: "jest" })),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));

const mockDispatch = jest.fn((action) => action);
let mockTeamName = "";

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: any) => unknown) =>
    selector({ user: { teamInvite: { teamName: mockTeamName } } }),
}));

jest.mock("@/store/slice/userSlice", () => ({
  fetchTeamInvite: jest.fn((token: string) => ({
    payload: token,
    type: "user/fetchTeamInvite",
  })),
}));

jest.mock("@/lib/utils/user", () => ({
  handleLoginSuccessCb: jest.fn(),
  makeLoginRegisterUrl: jest.fn(
    (url: string, params: Record<string, string>) =>
      `${url}?invite=${params.inviteToken || ""}&campaign=${
        params.campaignSlug || ""
      }`,
  ),
}));

jest.mock("@/lib/utils/registrationCampaign", () => ({
  getRegistrationCampaign: jest.fn(),
  isShowRegistrationCampaign: jest.fn(),
  syncCampaignCodeForThirdPartyAuth: jest.fn(),
}));

jest.mock("@/app/user/components/cloudflare-turnstile", () => ({
  useCloudflareTurnstile: jest.fn(() => mockTurnstileState),
}));

jest.mock("@/app/user/components/third-part-login-button", () => ({
  ThirdPartLoginButton: ({
    type,
    onClick,
  }: {
    type: string;
    onClick: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {type} login
    </button>
  ),
  githubLogin: jest.fn(),
  googleLogin: jest.fn(),
  huggingfaceLogin: jest.fn(),
}));

jest.mock("@/components/ui/standard/md-docs", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => <div>{content}</div>,
}));

jest.mock("@/app/user/login/components/FormNotice", () => ({
  FormNotice: () => <div data-testid="form-notice" />,
}));

jest.mock("@/lib/event", () => ({
  GA_ENVENT: {
    GITHUB_CLICK: "github_click",
    GOOGLE_CLICK: "google_click",
    HUGGINGFACE_CLICK: "huggingface_click",
  },
  dataLayerPushEvent: jest.fn(),
}));

jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));

const mockRouter = { push: jest.fn(), replace: jest.fn(), refresh: jest.fn() };
let mockSearchParams = new URLSearchParams();
const mockUsePathname = usePathname as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSearchParams = useSearchParams as jest.Mock;
const mockLogin = login as jest.Mock;
const mockMessageError = message.error as jest.Mock;
const mockCookiesSet = Cookies.set as jest.Mock;
const mockFetchTeamInvite = fetchTeamInvite as unknown as jest.Mock;
const mockHandleLoginSuccessCb = handleLoginSuccessCb as jest.Mock;
const mockGetRegistrationCampaign = getRegistrationCampaign as jest.Mock;
const mockIsShowRegistrationCampaign = isShowRegistrationCampaign as jest.Mock;
const mockSyncCampaignCodeForThirdPartyAuth =
  syncCampaignCodeForThirdPartyAuth as jest.Mock;
const mockDataLayerPushEvent = dataLayerPushEvent as jest.Mock;
const mockGoogleLogin = googleLogin as jest.Mock;
const mockGithubLogin = githubLogin as jest.Mock;
const mockHuggingfaceLogin = huggingfaceLogin as jest.Mock;

const mockResetWidget = jest.fn();
let mockTurnstileState = {
  TurnstileElement: <div data-testid="turnstile" />,
  cloudflareToken: "captcha-token",
  resetWidget: mockResetWidget,
  status: "solved",
};

function renderLoginForm(searchParams: Record<string, string> = {}) {
  return render(<LoginForm searchParams={searchParams} />);
}

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockTeamName = "";
    mockSearchParams = new URLSearchParams();
    mockTurnstileState = {
      TurnstileElement: <div data-testid="turnstile" />,
      cloudflareToken: "captcha-token",
      resetWidget: mockResetWidget,
      status: "solved",
    };
    mockUsePathname.mockReturnValue("/user/login");
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseSearchParams.mockImplementation(() => mockSearchParams);
    mockGetRegistrationCampaign.mockReturnValue(null);
    mockIsShowRegistrationCampaign.mockReturnValue(false);
    mockLogin.mockResolvedValue({ token: "login-token" });
  });

  it("stores invite and redirect query params and fetches invite team details", () => {
    mockSearchParams = new URLSearchParams({
      invite_token: "invite-1",
      redirect: "/models-console/library",
      utm_source: "newsletter",
    });

    renderLoginForm();

    expect(fetchTeamInvite).toHaveBeenCalledWith("invite-1");
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: "invite-1",
      type: "user/fetchTeamInvite",
    });
    expect(localStorage.getItem("sign_up_from")).toBe("newsletter");
    expect(localStorage.getItem("redirect")).toBe("/models-console/library");
    expect(mockCookiesSet).toHaveBeenCalledWith(
      "redirect",
      "/models-console/library",
    );
    expect(mockCookiesSet).toHaveBeenCalledWith("invite_token", "invite-1");
  });

  it("shows campaign and invite messaging when those states are available", () => {
    mockTeamName = "Core Infra";
    mockIsShowRegistrationCampaign.mockReturnValue(true);
    mockGetRegistrationCampaign.mockReturnValue({
      campaignCode: "campaign-code",
      campaignSlug: "campaign-slug",
      description: "Campaign markdown",
      title: "Campaign title",
    });

    renderLoginForm({ campaign: "campaign-slug" });

    expect(screen.getByText("Campaign title")).toBeInTheDocument();
    expect(screen.getByText("Campaign markdown")).toBeInTheDocument();
    expect(
      screen.getByText("You've been invited to join").parentElement,
    ).toHaveTextContent(/Core Infra\s*Team/);
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      expect.stringContaining("campaign=campaign-slug"),
    );
  });

  it("requires a solved captcha before email login submission", () => {
    mockTurnstileState = {
      ...mockTurnstileState,
      cloudflareToken: "",
      status: "expired",
    };

    renderLoginForm();

    fireEvent.click(screen.getByRole("button", { name: "Login with Email" }));
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(mockMessageError).toHaveBeenCalledWith(
      "Please finish the captcha first.",
    );
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("submits email login with collection, captcha and campaign context", async () => {
    mockGetRegistrationCampaign.mockReturnValue({
      campaignCode: "campaign-code",
      campaignSlug: "campaign-slug",
    });

    renderLoginForm();

    fireEvent.click(screen.getByRole("button", { name: "Login with Email" }));
    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "secure-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          cloudflareToken: "captcha-token",
          country: "US",
          email: "user@example.com",
          fromInviteCode: "campaign-code",
          password: "secure-password",
          redirectUrl: "/user/login",
          userAgent: "jest",
        }),
      );
      expect(mockHandleLoginSuccessCb).toHaveBeenCalledWith(
        expect.objectContaining({
          dispatch: mockDispatch,
          pathname: "/user/login",
          response: { token: "login-token" },
          router: mockRouter,
          searchParams: mockSearchParams,
        }),
      );
    });
  });

  it("shows the locked account message and skips captcha reset when lock time exists", async () => {
    mockLogin.mockRejectedValue({
      metadata: [1_725_523_200],
      reason: "USER_IS_LOCKED",
    });

    renderLoginForm();

    fireEvent.click(screen.getByRole("button", { name: "Login with Email" }));
    mockResetWidget.mockClear();
    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "locked@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "secure-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText(/Your account has been locked/),
    ).toBeInTheDocument();
    expect(mockResetWidget).not.toHaveBeenCalled();
  });

  it("tracks third-party login clicks and calls the selected provider", () => {
    renderLoginForm();

    fireEvent.click(screen.getByRole("button", { name: "google login" }));
    fireEvent.click(screen.getByRole("button", { name: "github login" }));
    fireEvent.click(screen.getByRole("button", { name: "huggingface login" }));

    expect(mockSyncCampaignCodeForThirdPartyAuth).toHaveBeenCalledTimes(3);
    expect(mockDataLayerPushEvent).toHaveBeenCalledWith({
      event: GA_ENVENT.GOOGLE_CLICK,
    });
    expect(mockDataLayerPushEvent).toHaveBeenCalledWith({
      event: GA_ENVENT.GITHUB_CLICK,
    });
    expect(mockDataLayerPushEvent).toHaveBeenCalledWith({
      event: GA_ENVENT.HUGGINGFACE_CLICK,
    });
    expect(mockGoogleLogin).toHaveBeenCalled();
    expect(mockGithubLogin).toHaveBeenCalled();
    expect(mockHuggingfaceLogin).toHaveBeenCalled();
  });
});
