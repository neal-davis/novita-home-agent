import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { set: jest.fn(), get: jest.fn(() => "") },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    id,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    id?: string;
  }) => (
    <button id={id} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

import {
  ThirdPartLoginButton,
  googleLogin,
  githubLogin,
  huggingfaceLogin,
  githubBinding,
} from "@/app/user/components/third-part-login-button";
import Cookies from "js-cookie";

const mockSet = Cookies.set as jest.Mock;

describe("ThirdPartLoginButton", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    // Replace window.location with a writable object
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "",
        origin: "https://novita.ai",
        hostname: "novita.ai",
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renders the github variant and fires onClick", () => {
    const onClick = jest.fn();
    render(<ThirdPartLoginButton type="github" onClick={onClick} />);
    expect(screen.getByText("Login with GitHub")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith("github");
  });

  it("renders the google variant and shows authorizing while loading", () => {
    const onClick = jest.fn();
    render(<ThirdPartLoginButton type="google" loading onClick={onClick} />);
    expect(screen.getByText("Authorizing...")).toBeInTheDocument();
    // loading short-circuits the click handler
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the huggingface variant", () => {
    render(<ThirdPartLoginButton type="huggingface" />);
    expect(screen.getByText("Login with Hugging Face")).toBeInTheDocument();
  });

  it("renders custom children for the default variant", () => {
    const onClick = jest.fn();
    render(
      <ThirdPartLoginButton onClick={onClick}>
        <span>Custom</span>
      </ThirdPartLoginButton>,
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("does not fire onClick when disabled", () => {
    const onClick = jest.fn();
    render(<ThirdPartLoginButton type="github" disabled onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("googleLogin builds the OAuth url without state on a known host", () => {
    googleLogin();
    expect(mockSet).toHaveBeenCalled();
    expect(window.location.href).toContain(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    expect(window.location.href).not.toContain("&state=");
  });

  it("googleLogin includes state on a cross-domain host", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: "",
        origin: "https://staging.example.com",
        hostname: "staging.example.com",
      },
    });
    googleLogin();
    expect(window.location.href).toContain("&state=");
  });

  it("githubLogin navigates to the github authorize url", () => {
    githubLogin();
    expect(window.location.href).toContain(
      "https://github.com/login/oauth/authorize",
    );
  });

  it("huggingfaceLogin sets a state cookie and navigates", () => {
    huggingfaceLogin();
    expect(window.location.href).toContain(
      "https://huggingface.co/oauth/authorize",
    );
    expect(mockSet).toHaveBeenCalled();
  });

  it("githubBinding navigates to the github authorize url", () => {
    githubBinding();
    expect(window.location.href).toContain(
      "https://github.com/login/oauth/authorize",
    );
  });
});
