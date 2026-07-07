import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { sendResetPwdEmail } from "@/api/user";
import { ResetForm } from "@/app/user/reset/components/ResetForm";
import { logout } from "@/store/slice/userSlice";

const mockBack = jest.fn();
const mockDispatch = jest.fn();
const mockPush = jest.fn();

jest.mock("@/api/user", () => ({
  sendResetPwdEmail: jest.fn(),
}));

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/store/slice/userSlice", () => ({
  logout: jest.fn(() => ({ type: "user/logout" })),
}));

jest.mock("@/components/ui/input", () => ({
  Input: ({
    onBlur,
    onChange,
    onInput,
    placeholder,
    value,
  }: {
    onBlur?: () => void;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onInput?: React.FormEventHandler<HTMLInputElement>;
    placeholder?: string;
    value?: string;
  }) => (
    <input
      aria-label={placeholder}
      onBlur={onBlur}
      onChange={onChange}
      onInput={onInput}
      placeholder={placeholder}
      value={value}
    />
  ),
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

const mockSendResetPwdEmail = sendResetPwdEmail as jest.Mock;
const mockLogout = logout as jest.Mock;

describe("ResetForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBack.mockClear();
    mockDispatch.mockClear();
    mockPush.mockClear();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
    });
    (usePathname as jest.Mock).mockReturnValue("/user/reset");
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it("validates the reset email before requesting a reset link", async () => {
    render(<ResetForm />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "ada@example.com" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Please enter a valid email address."),
      ).not.toBeInTheDocument();
    });
    expect(mockSendResetPwdEmail).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("prefills console reset email, logs out, and redirects to the reset notice", async () => {
    mockSendResetPwdEmail.mockResolvedValue({});
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("email=ada@example.com&from=console"),
    );

    render(<ResetForm />);

    const emailInput = screen.getByLabelText("Email address");
    await waitFor(() => {
      expect(emailInput).toHaveValue("ada@example.com");
    });
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    expect(
      screen.getByText(
        "Resetting your password will log you out of your current account",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockSendResetPwdEmail).toHaveBeenCalledWith("ada@example.com");
    });
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: "user/logout" });
    expect(mockPush).toHaveBeenCalledWith(
      "/user/login?notice_type=reset&email=ada@example.com",
    );
  });

  it("lets non-console users go back or navigate to signup", () => {
    render(<ResetForm />);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(mockBack).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Sign up"));
    expect(mockPush).toHaveBeenCalledWith("/user/register");
  });
});
