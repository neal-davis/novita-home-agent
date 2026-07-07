import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";

import { inviteCodeVerify, register } from "@/api/user";
import { SignupForm } from "@/app/user/register/components/SignupForm";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { message, notify } from "@/components/ui/standard/notify";
import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";
import { getUserCollect } from "@/lib/utils/utils";
import { syncCampaignCodeForThirdPartyAuth } from "@/lib/utils/registrationCampaign";
import { googleLogin } from "@/app/user/components/third-part-login-button";

const mockDispatch = jest.fn();
const mockPush = jest.fn();
const mockResetWidget = jest.fn();

let mockTurnstileState = {
  cloudflareToken: "",
  status: null as "solved" | "error" | "expired" | null,
};
let mockTeamName = "";

jest.mock("@/api/user", () => ({
  inviteCodeVerify: jest.fn(),
  register: jest.fn(),
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (
    selector: (state: { user: { teamInvite: { teamName: string } } }) => any,
  ) => selector({ user: { teamInvite: { teamName: mockTeamName } } }),
}));

jest.mock("@/store/slice/userSlice", () => ({
  fetchTeamInvite: jest.fn((token: string) => ({
    payload: token,
    type: "user/fetchTeamInvite",
  })),
}));

jest.mock("@/app/user/components/cloudflare-turnstile", () => ({
  useCloudflareTurnstile: () => ({
    TurnstileElement: <div data-testid="turnstile-widget" />,
    cloudflareToken: mockTurnstileState.cloudflareToken,
    resetWidget: mockResetWidget,
    status: mockTurnstileState.status,
  }),
}));

jest.mock("@/app/user/components/third-part-login-button", () => ({
  googleLogin: jest.fn(),
  githubLogin: jest.fn(),
  huggingfaceLogin: jest.fn(),
  ThirdPartLoginButton: ({
    id,
    loading,
    onClick,
    text,
    type,
  }: {
    id?: string;
    loading?: boolean;
    onClick?: (type?: string) => void;
    text?: string;
    type?: string;
  }) => (
    <button disabled={loading} id={id} onClick={() => onClick?.(type)}>
      {loading ? "Authorizing..." : text}
    </button>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    id,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    id?: string;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} id={id} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: ({ description }: { description?: string }) => (
    <div>{description}</div>
  ),
}));

jest.mock("@/components/ui/password-strength-input", () => ({
  PasswordStrengthInput: ({
    label,
    name,
    onBlur,
    onChange,
    onInput,
    placeholder,
    value,
  }: {
    label: string;
    name: string;
    onBlur?: () => void;
    onChange: (value: string) => void;
    onInput?: () => void;
    placeholder?: string;
    value: string;
  }) => (
    <label>
      {label}
      <input
        id={name}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        onInput={onInput}
        placeholder={placeholder}
        type="password"
        value={value}
      />
    </label>
  ),
}));

jest.mock("@/components/ui/standard/md-docs", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => <div>{content}</div>,
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
  },
  notify: {
    success: jest.fn(),
  },
}));

jest.mock("@/lib/utils/utils", () => ({
  getUserCollect: jest.fn(),
}));

jest.mock("@/lib/utils/registrationCampaign", () => ({
  getRegistrationCampaign: jest.fn(() => null),
  isShowRegistrationCampaign: jest.fn(() => false),
  syncCampaignCodeForThirdPartyAuth: jest.fn(),
}));

jest.mock("@/lib/event", () => ({
  dataLayerPushEvent: jest.fn(),
  GA_ENVENT: {
    GITHUB_CLICK: "github_click",
    GOOGLE_CLICK: "google_click",
    HUGGINGFACE_CLICK: "huggingface_click",
    SIGN_UP_SUCCESS: "sign_up_success",
  },
}));

jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));

const mockInviteCodeVerify = inviteCodeVerify as jest.Mock;
const mockRegister = register as jest.Mock;
const mockMessage = message as { error: jest.Mock };
const mockNotify = notify as { success: jest.Mock };
const mockCookies = Cookies as { set: jest.Mock };
const mockGetUserCollect = getUserCollect as jest.Mock;
const mockGoogleLogin = googleLogin as jest.Mock;
const mockSyncCampaignCodeForThirdPartyAuth =
  syncCampaignCodeForThirdPartyAuth as jest.Mock;
const mockDataLayerPushEvent = dataLayerPushEvent as jest.Mock;

function openEmailSignup() {
  fireEvent.click(screen.getByRole("button", { name: "Create with an Email" }));
}

describe("SignupForm", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockPush.mockClear();
    mockDispatch.mockClear();
    mockResetWidget.mockClear();
    mockTeamName = "";
    mockTurnstileState = {
      cloudflareToken: "",
      status: null,
    };
    mockGetUserCollect.mockReturnValue({ collectId: "collect-1" });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue("/user/register");
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("shows validation errors and does not register when required fields are invalid", async () => {
    render(<SignupForm searchParams={{}} />);

    openEmailSignup();
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Password must be at least 8 characters less than 64 characters and contain at least 1 letter, 1 number and 1 special character.",
      ),
    ).toBeInTheDocument();
    expect(mockInviteCodeVerify).not.toHaveBeenCalled();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("blocks email registration until the captcha has been solved", async () => {
    render(<SignupForm searchParams={{}} />);

    openEmailSignup();
    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith(
        "Please finish the captcha first.",
      );
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("verifies invite codes, registers, redirects, and reports activation success", async () => {
    mockTurnstileState = {
      cloudflareToken: "turnstile-token",
      status: "solved",
    };
    mockInviteCodeVerify.mockResolvedValue({ isValid: true });
    mockRegister.mockResolvedValue({});

    render(<SignupForm searchParams={{}} />);

    openEmailSignup();
    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Enter your invitation code"),
      {
        target: { value: "INVITE-1" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          allowNotification: true,
          cloudflareToken: "turnstile-token",
          collectId: "collect-1",
          confirmPassword: "Password1!",
          email: "ada@example.com",
          fromInviteCode: "INVITE-1",
          password: "Password1!",
          redirectUrl: "/user/login",
        }),
      );
    });
    expect(mockInviteCodeVerify).toHaveBeenCalledWith("INVITE-1");
    expect(mockDataLayerPushEvent).toHaveBeenCalledWith({
      event: GA_ENVENT.SIGN_UP_SUCCESS,
    });
    expect(mockCookies.set).toHaveBeenCalledWith("share_template_id", "");
    expect(mockCookies.set).toHaveBeenCalledWith("share_sharer_uuid", "");
    expect(mockPush).toHaveBeenCalledWith("/user/login");
    expect(mockNotify.success).toHaveBeenCalledWith("Activation email sent", {
      description: "Please check your email to activate your account.",
    });
  });

  it("surfaces invalid invitation codes without submitting registration", async () => {
    mockTurnstileState = {
      cloudflareToken: "turnstile-token",
      status: "solved",
    };
    mockInviteCodeVerify.mockResolvedValue({ isValid: false });

    render(<SignupForm searchParams={{}} />);

    openEmailSignup();
    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("Enter your invitation code"),
      {
        target: { value: "BAD-CODE" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith("Invalid invitation code");
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("syncs campaign state and starts Google OAuth from third-party signup", async () => {
    render(<SignupForm searchParams={{}} />);

    fireEvent.click(screen.getByText("Sign up with Google"));

    expect(mockSyncCampaignCodeForThirdPartyAuth).toHaveBeenCalledTimes(1);
    expect(mockDataLayerPushEvent).toHaveBeenCalledWith({
      event: GA_ENVENT.GOOGLE_CLICK,
    });
    expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Authorizing..." }),
    ).toHaveAttribute("id", CLICK_BTN_IDs.USER.GOOGLE_SIGN_UP);
  });
});
