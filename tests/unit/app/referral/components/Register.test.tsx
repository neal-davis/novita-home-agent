import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockPush = jest.fn();
const mockGoogleLogin = jest.fn();
const mockGithubLogin = jest.fn();
const mockHuggingfaceLogin = jest.fn();
const mockGithubBinding = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/api/user", () => ({ inviteCodeVerify: jest.fn() }));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));

jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { set: jest.fn() },
}));

jest.mock("@/app/user/components/third-part-login-button", () => ({
  googleLogin: () => mockGoogleLogin(),
  githubLogin: () => mockGithubLogin(),
  huggingfaceLogin: () => mockHuggingfaceLogin(),
  githubBinding: () => mockGithubBinding(),
  ThirdPartLoginButton: ({
    children,
    onClick,
    type,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    type?: string;
  }) => (
    <button type="button" onClick={onClick}>
      {children || `login-${type || "email"}`}
    </button>
  ),
}));

jest.mock("@/app/referral/components/StepDecorator", () => ({
  __esModule: true,
  default: ({ step }: { step: number }) => (
    <span data-testid={`step-${step}`}>step{step}</span>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
    disabled,
    placeholder,
  }: {
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    disabled?: boolean;
    placeholder?: string;
  }) => (
    <input
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={onChange}
    />
  ),
}));

import Register from "@/app/referral/components/Register";
import { inviteCodeVerify } from "@/api/user";

const mockVerify = inviteCodeVerify as jest.Mock;

describe("referral/Register", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => consoleError.mockRestore());

  it("renders the not-registered flow with the invite input and steps", () => {
    render(<Register invitedCode="" registered={false} isSubAccount={false} />);
    expect(
      screen.getByPlaceholderText("Enter invite code"),
    ).toBeInTheDocument();
    expect(screen.getByText("step1")).toBeInTheDocument();
    expect(screen.getByText("Register via email")).toBeInTheDocument();
  });

  it("hides the invite input when already registered", () => {
    render(
      <Register invitedCode="code-1" registered={true} isSubAccount={false} />,
    );
    expect(
      screen.queryByPlaceholderText("Enter invite code"),
    ).not.toBeInTheDocument();
    // Connect GitHub button is always rendered
    expect(screen.getByText("Connect GitHub")).toBeInTheDocument();
  });

  it("verifies the invite code before continuing the email flow", async () => {
    mockVerify.mockResolvedValue({ isValid: true });
    render(
      <Register invitedCode="code-1" registered={false} isSubAccount={false} />,
    );

    fireEvent.click(screen.getByText("Register via email"));
    await waitFor(() => expect(mockVerify).toHaveBeenCalledWith("code-1"));
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("code-1")),
    );
  });

  it("shows an error when the invite code is invalid", async () => {
    mockVerify.mockResolvedValue({ isValid: false });
    const { message } = jest.requireMock("@/components/ui/standard/notify") as {
      message: { error: jest.Mock };
    };

    render(
      <Register invitedCode="bad" registered={false} isSubAccount={false} />,
    );
    fireEvent.click(screen.getByText("Register via email"));

    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Invalid invitation code"),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("triggers github binding from the connect button", () => {
    render(<Register invitedCode="" registered={true} isSubAccount={false} />);
    fireEvent.click(screen.getByText("Connect GitHub"));
    expect(mockGithubBinding).toHaveBeenCalled();
  });

  it("shows the sub-account tip when isSubAccount is true", () => {
    render(<Register invitedCode="" registered={true} isSubAccount={true} />);
    expect(
      screen.getByText(/Only team owners can verify the account/),
    ).toBeInTheDocument();
  });
});
