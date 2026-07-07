jest.mock("@/api/config", () => ({
  getServerlessAccess: jest.fn(),
  getServerlessAccessEmail: jest.fn(),
  reportInternalEvent: jest.fn(),
}));

jest.mock("@/api/user", () => ({
  info: jest.fn(),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
  remove: jest.fn(),
  set: jest.fn(),
}));

jest.mock("@/lib/event", () => ({
  dataLayerPushEvent: jest.fn(),
  GA_ENVENT: {
    SIGN_IN_SUCCESS: "sign_in_success",
    SIGN_UP_SUCCESS: "sign_up_success",
  },
}));

jest.mock("@/store/slice/configSlice", () => ({
  setIsReg: jest.fn((payload) => ({ type: "config/setIsReg", payload })),
  setShowLoginModal: jest.fn((payload) => ({
    type: "config/setShowLoginModal",
    payload,
  })),
}));

jest.mock("@/store/slice/userSlice", () => ({
  fetchUserInfo: jest.fn(() => ({ type: "users/getUserInfo" })),
}));

jest.mock("@/store/slice/billingSlice", () => ({
  fetchBalanceDetail: jest.fn(() => ({ type: "billing/fetchBalanceDetail" })),
}));

import {
  getServerlessAccess,
  getServerlessAccessEmail,
  reportInternalEvent,
} from "@/api/config";
import { info } from "@/api/user";
import { dataLayerPushEvent } from "@/lib/event";
import {
  checkServerlessAccess,
  getSanitizedUserId,
  handleLoginSuccessCb,
  makeLoginRegisterUrl,
  SERVERLESS_ACCESS_KEY,
  syncServerlessAccess,
  syncServerlessAccessEmail,
} from "@/lib/utils/user";
import Cookies from "js-cookie";

const mockGetServerlessAccess = getServerlessAccess as jest.Mock;
const mockGetServerlessAccessEmail = getServerlessAccessEmail as jest.Mock;
const mockReportInternalEvent = reportInternalEvent as jest.Mock;
const mockInfo = info as jest.Mock;
const mockCookiesSet = Cookies.set as jest.Mock;
const mockDataLayerPushEvent = dataLayerPushEvent as jest.Mock;

function searchParams(values: Record<string, string | null> = {}) {
  return {
    get: jest.fn((key: string) => values[key] ?? null),
  } as any;
}

describe("user utilities", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
    mockGetServerlessAccess.mockResolvedValue([{ uuid: "uuid-1" }]);
    mockGetServerlessAccessEmail.mockResolvedValue([
      { email: "user@example.com" },
    ]);
    mockInfo.mockResolvedValue({ uid: 1, uuid: "uuid-1" });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("sanitizes user ids without hiding very short values", () => {
    expect(getSanitizedUserId("ab")).toBe("ab");
    expect(getSanitizedUserId("abcdef")).toBe("ab****ef");
    expect(getSanitizedUserId("abcdefghijklmnopqrstuvwxyz")).toBe(
      "abcde****vwxyz",
    );
    expect(getSanitizedUserId(123456789)).toBe("123****789");
  });

  it("syncs serverless access data and ignores empty or failed inputs", async () => {
    await syncServerlessAccessEmail({
      email: "user@example.com",
      uuid: "uuid-1",
    });
    expect(mockGetServerlessAccessEmail).toHaveBeenCalledWith({
      email: "user@example.com",
      uuid: "uuid-1",
    });
    expect(localStorage.getItem(SERVERLESS_ACCESS_KEY)).toBe(
      JSON.stringify([{ email: "user@example.com" }]),
    );

    localStorage.clear();
    await syncServerlessAccess({ mobilePhone: "15500000000", uuid: "uuid-1" });
    expect(mockGetServerlessAccess).toHaveBeenCalledWith({
      mobilePhone: "15500000000",
      uuid: "uuid-1",
    });
    expect(localStorage.getItem(SERVERLESS_ACCESS_KEY)).toBe(
      JSON.stringify([{ uuid: "uuid-1" }]),
    );

    await syncServerlessAccessEmail({ email: "", uuid: "" });
    await syncServerlessAccess({ mobilePhone: "", uuid: "" });
    expect(mockGetServerlessAccessEmail).toHaveBeenCalledTimes(1);
    expect(mockGetServerlessAccess).toHaveBeenCalledTimes(1);

    mockGetServerlessAccess.mockRejectedValueOnce(new Error("network"));
    await expect(
      syncServerlessAccess({ mobilePhone: "15500000000", uuid: "" }),
    ).resolves.toBeUndefined();
  });

  it("checks cached serverless access by email or uuid and handles invalid cache", () => {
    const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

    expect(
      checkServerlessAccess({ email: "", mobilePhone: "", uuid: "" }),
    ).toBe(false);

    localStorage.setItem(
      SERVERLESS_ACCESS_KEY,
      JSON.stringify([{ email: "user@example.com", uuid: "uuid-1" }]),
    );
    expect(
      checkServerlessAccess({
        email: "user@example.com",
        mobilePhone: "15500000000",
        uuid: "",
      }),
    ).toBe(true);
    expect(
      checkServerlessAccess({
        email: "other@example.com",
        mobilePhone: "",
        uuid: "uuid-1",
      }),
    ).toBe(true);
    expect(
      checkServerlessAccess({
        email: "other@example.com",
        mobilePhone: "15500000000",
        uuid: "uuid-2",
      }),
    ).toBe(false);

    localStorage.setItem(SERVERLESS_ACCESS_KEY, "not-json");
    expect(
      checkServerlessAccess({
        email: "user@example.com",
        mobilePhone: "15500000000",
        uuid: "uuid-1",
      }),
    ).toBe(false);

    mockConsoleLog.mockRestore();
  });

  it("handles invite-token login success without running the default dispatch flow", () => {
    const router = { push: jest.fn() } as any;
    const dispatch = jest.fn();

    handleLoginSuccessCb({
      response: { token: "token-1", isReg: "true" },
      searchParams: searchParams({ invite_token: "invite-1" }),
      router,
      dispatch,
      pathname: "/login",
    });

    expect(mockCookiesSet).toHaveBeenCalledWith("token", "token-1", {
      expires: 7,
    });
    expect(router.push).toHaveBeenCalledWith("/team-invite?token=invite-1");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("handles redirect login success, reporting and analytics side effects", async () => {
    const router = { push: jest.fn() } as any;
    const dispatch = jest.fn();
    localStorage.setItem("redirect", "/");

    handleLoginSuccessCb({
      response: { token: "token-2", isReg: "false" },
      searchParams: searchParams(),
      router,
      dispatch,
      pathname: "/de/user/login",
    });

    expect(router.push).toHaveBeenCalledWith("/de/console");
    expect(localStorage.getItem("redirect")).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: false,
        type: "config/setIsReg",
      }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: false,
        type: "config/setShowLoginModal",
      }),
    );

    await jest.runOnlyPendingTimersAsync();
    expect(mockInfo).toHaveBeenCalled();
    expect(mockReportInternalEvent).toHaveBeenCalledWith({
      uid: 1,
      action: "LOGIN",
    });
    expect(mockDataLayerPushEvent).toHaveBeenCalledWith({
      event: "sign_in_success",
    });
  });

  it("builds login/register URLs from optional campaign params", () => {
    expect(
      makeLoginRegisterUrl("/user/login", {
        inviteToken: "invite-1",
        source: "docs",
        campaignSlug: "launch",
      }),
    ).toBe("/user/login?invite_token=invite-1&utm_source=docs&launch=1");
    expect(makeLoginRegisterUrl("/user/login", {})).toBe("/user/login");
  });
});
