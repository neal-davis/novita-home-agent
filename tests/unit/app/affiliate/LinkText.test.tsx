import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

const messageSuccess = jest.fn();
jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: (...a: unknown[]) => messageSuccess(...a) },
}));

jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({ children, onCopy }: any) => (
    <div onClick={onCopy}>{children}</div>
  ),
}));

import { LinkText } from "@/app/affiliate/LinkText";

describe("affiliate LinkText", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the children content", () => {
    render(<LinkText text="copy-me">visible</LinkText>);
    expect(screen.getByText("visible")).toBeInTheDocument();
  });

  it("fires a success toast when copied", () => {
    render(<LinkText text="copy-me">visible</LinkText>);
    fireEvent.click(screen.getByText("visible"));
    expect(messageSuccess).toHaveBeenCalledWith("Copied success");
  });
});
