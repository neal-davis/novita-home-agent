import { fireEvent, render, screen } from "@testing-library/react";
import Cookies from "js-cookie";

import {
  githubLogin,
  googleLogin,
  huggingfaceLogin,
  ThirdPartLoginButton,
} from "@/app/user/components/third-part-login-button";
import {
  AUTH_CB_URL,
  AUTH_CB_URL_KEY,
  AUTH_STATE,
  AUTH_TYPE,
  AUTH_TYPE_GITHUB,
  AUTH_TYPE_GOOGLE,
  AUTH_TYPE_HUGGINGFACE,
} from "@/constants/auth";

jest.mock("js-cookie", () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    id,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    id?: string;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} id={id} onClick={onClick} type="button">
      {children}
    </button>
  ),
}));

const mockCookies = Cookies as {
  get: jest.Mock;
  set: jest.Mock;
};

describe("third-party login helpers and button", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.get.mockReturnValue(undefined);
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("renders provider buttons, forwards provider type, and suppresses duplicate clicks while loading", () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <ThirdPartLoginButton
        id="google-auth"
        onClick={onClick}
        text="Continue with Google"
        type="google"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );
    expect(onClick).toHaveBeenCalledWith("google");

    rerender(
      <ThirdPartLoginButton
        id="google-auth"
        loading
        onClick={onClick}
        text="Continue with Google"
        type="google"
      />,
    );

    expect(screen.getByRole("button", { name: /Authorizing/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Authorizing/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("prepares Google OAuth cookies before handing off to the provider", () => {
    googleLogin();

    expect(mockCookies.set).toHaveBeenCalledWith(
      AUTH_CB_URL_KEY,
      encodeURIComponent(window.location.origin + AUTH_CB_URL),
    );
    expect(mockCookies.set).toHaveBeenCalledWith(AUTH_TYPE, AUTH_TYPE_GOOGLE);
  });

  it("prepares GitHub OAuth cookies before handing off to the provider", () => {
    githubLogin();

    expect(mockCookies.set).toHaveBeenCalledWith(
      AUTH_CB_URL_KEY,
      encodeURIComponent(window.location.origin + AUTH_CB_URL),
    );
    expect(mockCookies.set).toHaveBeenCalledWith(AUTH_TYPE, AUTH_TYPE_GITHUB);
  });

  it("stores an auth state token for Hugging Face OAuth", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);

    huggingfaceLogin();

    expect(mockCookies.set).toHaveBeenCalledWith(
      AUTH_CB_URL_KEY,
      encodeURIComponent(window.location.origin + AUTH_CB_URL),
    );
    expect(mockCookies.set).toHaveBeenCalledWith(
      AUTH_TYPE,
      AUTH_TYPE_HUGGINGFACE,
    );
    expect(mockCookies.set).toHaveBeenCalledWith(
      AUTH_STATE,
      expect.any(String),
    );
  });
});
