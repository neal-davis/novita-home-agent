import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

const messageSuccess = jest.fn();
jest.mock("@/components/ui/standard/notify", () => ({
  message: { success: (...a: unknown[]) => messageSuccess(...a) },
}));

// Capture the text passed to CopyToClipboard so we can assert the
// empty-string fallback branch (text ?? "").
const copyProps: { text?: string } = {};
jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({ children, onCopy, text }: any) => {
    copyProps.text = text;
    return <div onClick={onCopy}>{children}</div>;
  },
}));

import { LinkText } from "@/app/affiliate/LinkText";

describe("affiliate LinkText (more)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    copyProps.text = undefined;
  });

  it("falls back to an empty copy string when text is null", () => {
    render(<LinkText text={null as unknown as string}>visible</LinkText>);
    expect(copyProps.text).toBe("");
  });

  it("passes a provided text through and still toasts on copy", () => {
    render(
      <LinkText text="real-link" className="extra">
        visible
      </LinkText>,
    );
    expect(copyProps.text).toBe("real-link");
    fireEvent.click(screen.getByText("visible"));
    expect(messageSuccess).toHaveBeenCalledWith("Copied success");
  });
});
