import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { LabelInput, LabelPassword } from "@/app/user/components/label-input";

describe("LabelInput", () => {
  it("renders the label and forwards input changes", () => {
    const onChange = jest.fn();
    render(
      <LabelInput
        name="email"
        label="Email"
        value=""
        onChange={onChange}
        placeholder="you@x.com"
      />,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("you@x.com"), {
      target: { value: "a@b.com" },
    });
    expect(onChange).toHaveBeenCalledWith("a@b.com");
  });

  it("renders a required marker when isRequired", () => {
    render(
      <LabelInput
        name="email"
        label="Email"
        value=""
        onChange={jest.fn()}
        isRequired
      />,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});

describe("LabelPassword", () => {
  it("toggles password visibility", () => {
    const { container } = render(
      <LabelPassword
        name="pwd"
        label="Password"
        value="secret"
        onChange={jest.fn()}
      />,
    );
    const input = container.querySelector("#pwd") as HTMLInputElement;
    expect(input.type).toBe("password");
    const toggle = container.querySelector("span.cursor-pointer")!;
    fireEvent.click(toggle);
    expect(input.type).toBe("text");
  });
});
