import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";

import { resetPwd } from "@/api/user";
import ResetTokenForm from "@/app/user/reset/[token]/components/resetForm";
import { message } from "@/components/ui/standard/notify";

const mockReplace = jest.fn();

jest.mock("@/api/user", () => ({
  resetPwd: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
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

jest.mock("@/components/ui/input", () => ({
  Input: ({
    className,
    disabled,
    id,
    onBlur,
    onChange,
    onInput,
    placeholder,
    type,
    value,
  }: {
    className?: string;
    disabled?: boolean;
    id?: string;
    onBlur?: () => void;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onInput?: React.FormEventHandler<HTMLInputElement>;
    placeholder?: string;
    type?: string;
    value?: string;
  }) => (
    <input
      className={className}
      disabled={disabled}
      id={id}
      onBlur={onBlur}
      onChange={onChange}
      onInput={onInput}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label htmlFor={htmlFor}>{children}</label>,
}));

const mockResetPwd = resetPwd as jest.Mock;
const mockMessage = message as {
  error: jest.Mock;
  success: jest.Mock;
};

function enterPasswords(password: string, confirmPassword = password) {
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Password Confirmation"), {
    target: { value: confirmPassword },
  });
}

describe("reset token ResetForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplace.mockClear();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("email=ada@example.com"),
    );
  });

  it("blocks reset submission when the password confirmation does not match", async () => {
    render(<ResetTokenForm token="reset-token" />);

    enterPasswords("Password1!", "Password2!");
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(
      await screen.findByText("Password does not match."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Password Confirmation"), {
      target: { value: "Password1!" },
    });

    await waitFor(() => {
      expect(screen.queryByText("Password does not match.")).toBeNull();
    });
    expect(mockResetPwd).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("shows an error when the reset link email is invalid", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("email=not-an-email"),
    );

    render(<ResetTokenForm token="reset-token" />);

    enterPasswords("Password1!");
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockMessage.error).toHaveBeenCalledWith("Invalid email address.");
    });
    expect(mockResetPwd).not.toHaveBeenCalled();
  });

  it("resets the password and redirects to login on success", async () => {
    mockResetPwd.mockResolvedValue({});

    render(<ResetTokenForm token="reset-token" />);

    enterPasswords("Password1!");
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockResetPwd).toHaveBeenCalledWith({
        confirmPassword: "Password1!",
        email: "ada@example.com",
        password: "Password1!",
        token: "reset-token",
      });
    });
    expect(mockMessage.success).toHaveBeenCalledWith(
      "Password reset successfully.",
    );
    expect(mockReplace).toHaveBeenCalledWith("/?login=true");
  });
});
