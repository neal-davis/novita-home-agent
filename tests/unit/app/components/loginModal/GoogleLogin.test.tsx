import { render, waitFor } from "@testing-library/react";
import GoogleAuth from "@/app/components/loginModal/GoogleLogin";
import { GoogleLogin } from "@/api/user";
import { getUserCollect } from "@/lib/utils/utils";
import Cookies from "js-cookie";

jest.mock("@/api/user", () => ({ GoogleLogin: jest.fn() }));
jest.mock("@/lib/utils/utils", () => ({
  getUserCollect: jest.fn(() => ({ source: "test" })),
}));
jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockGoogleLogin = GoogleLogin as jest.Mock;
const mockCookieGet = Cookies.get as unknown as jest.Mock;

function installGoogle() {
  const initialize = jest.fn();
  const renderButton = jest.fn();
  const prompt = jest.fn();
  (window as any).google = {
    accounts: { id: { initialize, renderButton, prompt } },
  };
  return { initialize, renderButton, prompt };
}

describe("GoogleAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    delete (window as any).google;
  });
  afterEach(() => jest.useRealTimers());

  it("initializes and renders the google button, prompting when no token", () => {
    const { initialize, renderButton, prompt } = installGoogle();
    mockCookieGet.mockReturnValue(undefined);
    render(<GoogleAuth width={250} />);
    jest.runOnlyPendingTimers();

    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: expect.any(String) }),
    );
    expect(renderButton).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ width: "250px" }),
    );
    expect(prompt).toHaveBeenCalled();
  });

  it("does not prompt when a token cookie already exists", () => {
    const { prompt } = installGoogle();
    mockCookieGet.mockReturnValue("existing-token");
    render(<GoogleAuth />);
    jest.runOnlyPendingTimers();
    expect(prompt).not.toHaveBeenCalled();
  });

  it("does nothing when window.google is unavailable", () => {
    render(<GoogleAuth />);
    expect(() => jest.runOnlyPendingTimers()).not.toThrow();
    expect(mockGoogleLogin).not.toHaveBeenCalled();
  });

  it("calls GoogleLogin and the callback on a successful credential response", async () => {
    const { initialize } = installGoogle();
    mockCookieGet.mockReturnValue("t");
    mockGoogleLogin.mockResolvedValue({ ok: true });
    const callback = jest.fn();
    render(<GoogleAuth callback={callback} />);
    jest.runOnlyPendingTimers();

    const handler = initialize.mock.calls[0][0].callback;
    await handler({ credential: "abc" });

    expect(mockGoogleLogin).toHaveBeenCalledWith(
      expect.objectContaining({ idToken: "abc", source: "test" }),
    );
    await waitFor(() => expect(callback).toHaveBeenCalledWith({ ok: true }));
  });

  it("ignores credential responses without a credential", () => {
    const { initialize } = installGoogle();
    mockCookieGet.mockReturnValue("t");
    render(<GoogleAuth />);
    jest.runOnlyPendingTimers();
    const handler = initialize.mock.calls[0][0].callback;
    handler({});
    expect(mockGoogleLogin).not.toHaveBeenCalled();
  });
});
