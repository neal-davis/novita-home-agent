import { fireEvent, render, screen } from "@testing-library/react";
import { PasswordStrengthInput } from "@/components/ui/password-strength-input";

function setup(value = "", props: any = {}) {
  const onChange = jest.fn();
  const utils = render(
    <PasswordStrengthInput
      value={value}
      onChange={onChange}
      label="Password"
      name="pwd"
      {...props}
    />,
  );
  return { onChange, ...utils };
}

describe("PasswordStrengthInput", () => {
  it("renders the label", () => {
    setup();
    expect(screen.getByText("Password")).toBeInTheDocument();
  });

  it("shows a required marker when isRequired", () => {
    setup("", { isRequired: true });
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("calls onChange and shows the strength indicator while typing", () => {
    const { onChange } = setup();
    const input = document.getElementById("pwd") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledWith("abc");
    expect(screen.getByText("Password requirements:")).toBeInTheDocument();
  });

  it("marks all rules passed for a strong password", () => {
    setup("Abcdef1!");
    const input = document.getElementById("pwd") as HTMLInputElement;
    fireEvent.focus(input);
    // strong password meets all four rules -> all labels are green
    expect(
      screen.getByText("At least 8 characters and less than 64 characters"),
    ).toHaveClass("text-green-600");
    expect(screen.getByText("Contains number")).toHaveClass("text-green-600");
    expect(screen.getByText("Contains special character")).toHaveClass(
      "text-green-600",
    );
  });

  it("toggles password visibility", () => {
    const { container } = setup("secret");
    const input = container.querySelector("#pwd") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "password");
    const toggle = container.querySelector(
      ".cursor-pointer",
    ) as HTMLElement | null;
    expect(toggle).not.toBeNull();
    fireEvent.click(toggle as HTMLElement);
    expect(input).toHaveAttribute("type", "text");
  });

  it("hides the indicator and calls onBlur on blur", () => {
    const onBlur = jest.fn();
    setup("abc", { onBlur });
    const input = document.getElementById("pwd") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
    expect(
      screen.queryByText("Password requirements:"),
    ).not.toBeInTheDocument();
  });

  it("applies error border styling when status is error", () => {
    setup("x", { status: "error" });
    const input = document.getElementById("pwd") as HTMLInputElement;
    expect(input.className).toContain("!border-red-500");
  });
});
