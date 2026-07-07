import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

const githubBinding = jest.fn();
jest.mock("@/app/user/components/third-part-login-button", () => ({
  githubBinding: (...a: unknown[]) => githubBinding(...a),
  ThirdPartLoginButton: ({ text, onClick }: any) => (
    <button onClick={onClick}>{text}</button>
  ),
}));

const cookieSet = jest.fn();
jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { set: (...a: unknown[]) => cookieSet(...a) },
}));

import BindGithub from "@/app/referral/components/BindGithub";

describe("referral BindGithub", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the verify card and connect button", () => {
    render(<BindGithub invitedCode="INV" isSubAccount={false} />);
    expect(
      screen.getByText("Verify to start receiving vouchers"),
    ).toBeInTheDocument();
    expect(screen.getByText("Connect GitHub")).toBeInTheDocument();
  });

  it("sets the invite cookie and starts github binding on click", () => {
    render(<BindGithub invitedCode="INV" isSubAccount={false} />);
    fireEvent.click(screen.getByText("Connect GitHub"));
    expect(cookieSet).toHaveBeenCalledWith(expect.any(String), "INV");
    expect(githubBinding).toHaveBeenCalled();
  });

  it("shows the sub-account tip when isSubAccount is true", () => {
    render(<BindGithub invitedCode="INV" isSubAccount={true} />);
    expect(
      screen.getByText(/Only team owners can verify the account/),
    ).toBeInTheDocument();
  });
});
