import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";

import { verifyEmail } from "@/api/user";
import { Form } from "@/app/user/email-validate/Form";
import { message, notify } from "@/components/ui/standard/notify";
import { dataLayerPushEvent, GA_ENVENT } from "@/lib/event";

const mockResetWidget = jest.fn();
let mockTurnstileState = {
  cloudflareToken: "captcha-token",
  status: "solved" as "solved" | "expired" | null,
};

jest.mock("@/api/user", () => ({
  verifyEmail: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
  notify: { success: jest.fn() },
}));

jest.mock("@/lib/event", () => ({
  dataLayerPushEvent: jest.fn(),
  GA_ENVENT: { SIGN_UP_SUCCESS: "sign_up_success" },
}));

jest.mock("@/app/user/components/cloudflare-turnstile", () => ({
  useCloudflareTurnstile: () => ({
    TurnstileElement: <div data-testid="turnstile" />,
    cloudflareToken: mockTurnstileState.cloudflareToken,
    resetWidget: mockResetWidget,
    status: mockTurnstileState.status,
  }),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

const mockVerifyEmail = verifyEmail as jest.Mock;
const mockMessageError = message.error as jest.Mock;
const mockNotifySuccess = notify.success as jest.Mock;
const mockDataLayer = dataLayerPushEvent as jest.Mock;
const mockPush = jest.fn();

function setSearch(query: string) {
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(query));
}

describe("email-validate Form", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockResetWidget.mockClear();
    mockTurnstileState = { cloudflareToken: "captcha-token", status: "solved" };
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    setSearch("token=tok-1&email=ada@example.com");
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders the verification copy and confirm button", () => {
    render(<Form />);
    expect(screen.getByText("Email verification")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm my account" }),
    ).toBeInTheDocument();
  });

  it("rejects submission when token or email params are missing", async () => {
    setSearch("");
    render(<Form />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm my account" }));

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith("Invalid params.");
    });
    expect(mockVerifyEmail).not.toHaveBeenCalled();
  });

  it("requires a solved captcha before verifying", async () => {
    mockTurnstileState = { cloudflareToken: "", status: "expired" };
    render(<Form />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm my account" }));

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalledWith(
        "Please finish the captcha first.",
      );
    });
    expect(mockVerifyEmail).not.toHaveBeenCalled();
  });

  it("normalizes spaces back to + in the email param before verifying", async () => {
    setSearch("token=tok-1&email=ada b@example.com");
    mockVerifyEmail.mockResolvedValue({});
    render(<Form />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm my account" }));

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith({
        token: "tok-1",
        email: "ada+b@example.com",
        cloudflareToken: "captcha-token",
      });
    });
  });

  it("verifies the email, reports success, fires analytics, and redirects to login", async () => {
    mockVerifyEmail.mockResolvedValue({});
    render(<Form />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm my account" }));

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith({
        token: "tok-1",
        email: "ada@example.com",
        cloudflareToken: "captcha-token",
      });
    });
    expect(mockNotifySuccess).toHaveBeenCalledWith("Email verified", {
      description: "You can now proceed to the next step.",
    });
    expect(mockDataLayer).toHaveBeenCalledWith(
      { event: GA_ENVENT.SIGN_UP_SUCCESS },
      false,
      { posthog: false },
    );
    expect(mockPush).toHaveBeenCalled();
    expect(mockResetWidget).not.toHaveBeenCalled();
  });

  it("resets the captcha widget when verification fails", async () => {
    mockVerifyEmail.mockRejectedValue(new Error("boom"));
    render(<Form />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm my account" }));

    await waitFor(() => {
      expect(mockResetWidget).toHaveBeenCalledTimes(1);
    });
    expect(mockNotifySuccess).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
