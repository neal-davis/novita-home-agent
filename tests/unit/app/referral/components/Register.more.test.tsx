import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockPush = jest.fn();
const mockGoogleLogin = jest.fn();
const mockGithubLogin = jest.fn();
const mockHuggingfaceLogin = jest.fn();
const mockGithubBinding = jest.fn();
const mockCookieSet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/api/user", () => ({ inviteCodeVerify: jest.fn() }));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));

jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { set: (...a: unknown[]) => mockCookieSet(...a) },
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

describe("referral/Register (more)", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => consoleError.mockRestore());

  it("updates the invite code as the user types when no code is preset", () => {
    render(<Register invitedCode="" registered={false} isSubAccount={false} />);
    const input = screen.getByPlaceholderText("Enter invite code");
    fireEvent.change(input, { target: { value: "  NEW123  " } });
    // value is trimmed before being stored
    expect((input as HTMLInputElement).value).toBe("NEW123");
  });

  it("skips verification and proceeds directly when there is no invite code", () => {
    render(<Register invitedCode="" registered={false} isSubAccount={false} />);
    fireEvent.click(screen.getByText("Register via email"));
    expect(mockVerify).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/user/register"),
    );
  });

  it("logs an error and does not continue when verification throws", async () => {
    mockVerify.mockRejectedValueOnce(new Error("network"));
    render(
      <Register invitedCode="code-1" registered={false} isSubAccount={false} />,
    );
    fireEvent.click(screen.getByText("Register via email"));
    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("starts the google login flow and stores referral cookies", () => {
    render(<Register invitedCode="" registered={false} isSubAccount={false} />);
    fireEvent.click(screen.getByText("login-google"));
    expect(mockCookieSet).toHaveBeenCalled();
    expect(mockGoogleLogin).toHaveBeenCalled();
  });

  it("starts the github and huggingface login flows", () => {
    render(<Register invitedCode="" registered={false} isSubAccount={false} />);
    fireEvent.click(screen.getByText("login-github"));
    expect(mockGithubLogin).toHaveBeenCalled();
    fireEvent.click(screen.getByText("login-huggingface"));
    expect(mockHuggingfaceLogin).toHaveBeenCalled();
  });
});
