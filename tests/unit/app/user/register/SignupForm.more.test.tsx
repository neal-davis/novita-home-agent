import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { inviteCodeVerify, register } from "@/api/user";
import { SignupForm } from "@/app/user/register/components/SignupForm";
import { message } from "@/components/ui/standard/notify";
import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";
import { getUserCollect } from "@/lib/utils/utils";
import {
  getRegistrationCampaign,
  isShowRegistrationCampaign,
  syncCampaignCodeForThirdPartyAuth,
} from "@/lib/utils/registrationCampaign";
import {
  githubLogin,
  huggingfaceLogin,
} from "@/app/user/components/third-part-login-button";

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
  message: { error: jest.fn() },
  notify: { success: jest.fn() },
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

jest.mock("js-cookie", () => ({ set: jest.fn() }));

const mockInviteCodeVerify = inviteCodeVerify as jest.Mock;
const mockRegister = register as jest.Mock;
const mockMessage = message as { error: jest.Mock };
const mockGetUserCollect = getUserCollect as jest.Mock;
const mockGithubLogin = githubLogin as jest.Mock;
const mockHuggingfaceLogin = huggingfaceLogin as jest.Mock;
const mockSync = syncCampaignCodeForThirdPartyAuth as jest.Mock;
const mockDataLayer = dataLayerPushEvent as jest.Mock;
const mockGetRegistrationCampaign = getRegistrationCampaign as jest.Mock;
const mockIsShowRegistrationCampaign = isShowRegistrationCampaign as jest.Mock;

function openEmailSignup() {
  fireEvent.click(screen.getByRole("button", { name: "Create with an Email" }));
}

describe("SignupForm more branches", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockTeamName = "";
    mockTurnstileState = { cloudflareToken: "", status: null };
    mockGetUserCollect.mockReturnValue({ collectId: "collect-1" });
    mockGetRegistrationCampaign.mockReturnValue(null);
    mockIsShowRegistrationCampaign.mockReturnValue(false);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue("/user/register");
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("starts hidden then reveals the email form after clicking create with email", () => {
    render(<SignupForm searchParams={{}} />);

    expect(
      screen.queryByPlaceholderText("Enter your email address"),
    ).toBeNull();

    openEmailSignup();

    expect(
      screen.getByPlaceholderText("Enter your email address"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create with an Email" }),
    ).toBeNull();
  });

  it("shows only the email error when a valid password but invalid email is entered", async () => {
    render(<SignupForm searchParams={{}} />);
    openEmailSignup();

    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Password must be at least 8 characters less than 64 characters and contain at least 1 letter, 1 number and 1 special character.",
      ),
    ).toBeNull();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("validates email on blur", async () => {
    render(<SignupForm searchParams={{}} />);
    openEmailSignup();

    const emailInput = screen.getByPlaceholderText("Enter your email address");
    fireEvent.change(emailInput, { target: { value: "bad" } });
    fireEvent.blur(emailInput);

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("resets the captcha widget when registration rejects", async () => {
    mockTurnstileState = {
      cloudflareToken: "turnstile-token",
      status: "solved",
    };
    mockRegister.mockRejectedValue(new Error("server down"));

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
      expect(mockResetWidget).toHaveBeenCalledTimes(1);
    });
  });

  it("registers without invite verification when no invite code is provided", async () => {
    mockTurnstileState = {
      cloudflareToken: "turnstile-token",
      status: "solved",
    };
    mockRegister.mockResolvedValue({});

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
      expect(mockRegister).toHaveBeenCalled();
    });
    expect(mockInviteCodeVerify).not.toHaveBeenCalled();
  });

  it("starts GitHub OAuth from the third-party signup button", () => {
    render(<SignupForm searchParams={{}} />);

    fireEvent.click(screen.getByText("Sign up with GitHub"));

    expect(mockSync).toHaveBeenCalledTimes(1);
    expect(mockDataLayer).toHaveBeenCalledWith({
      event: GA_ENVENT.GITHUB_CLICK,
    });
    expect(mockGithubLogin).toHaveBeenCalledTimes(1);
  });

  it("starts Hugging Face OAuth from the third-party signup button", () => {
    render(<SignupForm searchParams={{}} />);

    fireEvent.click(screen.getByText("Sign up with Hugging Face"));

    expect(mockSync).toHaveBeenCalledTimes(1);
    expect(mockDataLayer).toHaveBeenCalledWith({
      event: GA_ENVENT.HUGGINGFACE_CLICK,
    });
    expect(mockHuggingfaceLogin).toHaveBeenCalledTimes(1);
  });

  it("clears the email error when the email is corrected while another field still has an error", async () => {
    render(<SignupForm searchParams={{}} />);
    openEmailSignup();

    const emailInput = screen.getByPlaceholderText("Enter your email address");
    fireEvent.change(emailInput, {
      target: { value: "bad" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "weak" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    fireEvent.change(emailInput, {
      target: { value: "lunaisthebest0704@gmail.com" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Please enter a valid email address."),
      ).toBeNull();
    });
    expect(
      screen.getByText(
        "Password must be at least 8 characters less than 64 characters and contain at least 1 letter, 1 number and 1 special character.",
      ),
    ).toBeInTheDocument();
  });

  it("prefills an affiliate invite code without forcing a valid email into an error state", async () => {
    mockInviteCodeVerify.mockResolvedValue({ isValid: true });
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("invited_code=KILOCODEJUNE"),
    );

    render(<SignupForm searchParams={{}} />);
    openEmailSignup();

    expect(
      screen.getByPlaceholderText("Enter your invitation code"),
    ).toHaveValue("KILOCODEJUNE");
    expect(
      screen.getByPlaceholderText("Enter your invitation code"),
    ).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { value: "lunaisthebest0704@gmail.com" },
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
    expect(
      screen.queryByText("Please enter a valid email address."),
    ).not.toBeInTheDocument();
    expect(mockInviteCodeVerify).toHaveBeenCalledWith("KILOCODEJUNE");
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("shows the invited team banner when a team invite is present", () => {
    mockTeamName = "Platform";

    render(<SignupForm searchParams={{}} />);

    expect(
      screen.getByText("You've been invited to join").parentElement,
    ).toHaveTextContent(/Platform\s*Team/);
  });

  it("blocks registration with an invalid invite code", async () => {
    mockTurnstileState = {
      cloudflareToken: "turnstile-token",
      status: "solved",
    };
    mockInviteCodeVerify.mockResolvedValue(null);

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
      { target: { value: "BAD" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Create an account" }));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith("Invalid invitation code");
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });
});
