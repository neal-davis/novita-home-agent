import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

let params = new URLSearchParams();
jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useSearchParams: () => params,
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

const sendActiveEmail = jest.fn();
jest.mock("@/api/user", () => ({
  sendActiveEmail: (...a: unknown[]) => sendActiveEmail(...a),
}));

const dataLayerPushEvent = jest.fn();
jest.mock("@/lib/event", () => ({
  dataLayerPushEvent: (...a: unknown[]) => dataLayerPushEvent(...a),
  GA_ENVENT: { SIGN_UP_SUCCESS: "sign_up_success" },
}));

import { FormNotice } from "@/app/user/login/components/FormNotice";
import { message } from "@/components/ui/standard/notify";

describe("FormNotice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    params = new URLSearchParams();
  });

  it("renders nothing when there is no notice or verify result", () => {
    const { container } = render(<FormNotice />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the email verified message on verify_res=success", () => {
    params = new URLSearchParams("verify_res=success");
    render(<FormNotice />);
    expect(screen.getByText("Email verified successfully")).toBeInTheDocument();
  });

  it("shows the verification failed message on verify_res=failed", () => {
    params = new URLSearchParams("verify_res=failed");
    render(<FormNotice />);
    expect(screen.getByText("Email verification failed")).toBeInTheDocument();
  });

  it("renders the active notice with a resend countdown widget", () => {
    params = new URLSearchParams("notice_type=active&email=me@x.com");
    render(<FormNotice />);
    expect(
      screen.getByText(/instructions on how to activate/),
    ).toBeInTheDocument();
    // TimeInterval starts immediately so it shows the countdown text
    expect(screen.getByText("60s")).toBeInTheDocument();
  });

  it("renders the reset-password notice", () => {
    params = new URLSearchParams("notice_type=reset");
    render(<FormNotice />);
    expect(
      screen.getByText(/instructions on how to reset your password/),
    ).toBeInTheDocument();
  });
});
