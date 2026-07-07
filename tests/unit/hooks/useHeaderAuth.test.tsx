import { renderHook, waitFor } from "@testing-library/react";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { message } from "@/components/ui/standard/notify";
import {
  fetchAllTeamMembers,
  fetchUserInfo,
  setUserState,
  UserState,
} from "@/store/slice/userSlice";
import { fetchBalanceDetail } from "@/store/slice/billingSlice";
import { fetchEnterprise, fetchUserDiscount } from "@/store/slice/configSlice";

const mockDispatch = jest.fn((action) => action);
let mockState: any;
const mockRouterPush = jest.fn();

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: any) => unknown) => selector(mockState),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: jest.fn(
    (path: string, locale: string) => `/${locale}${path}`,
  ),
  getPathnameWithoutLocale: jest.fn((path: string) =>
    path.replace(/^\/[a-z]{2}(?=\/)/, ""),
  ),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn() },
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

jest.mock("@/store/slice/userSlice", () => ({
  UserState: { login: 1, logout: 2 },
  fetchAllTeamMembers: jest.fn(() => ({ type: "user/fetchAllTeamMembers" })),
  fetchUserInfo: jest.fn(() => ({ type: "user/fetchUserInfo" })),
  logout: jest.fn(() => ({ type: "user/logout" })),
  setUserState: jest.fn((state) => ({ payload: state, type: "user/setState" })),
}));

jest.mock("@/store/slice/billingSlice", () => ({
  fetchBalanceDetail: jest.fn(() => ({ type: "billing/fetchBalanceDetail" })),
}));

jest.mock("@/store/slice/configSlice", () => ({
  fetchEnterprise: jest.fn(() => ({ type: "config/fetchEnterprise" })),
  fetchUserDiscount: jest.fn(() => ({ type: "config/fetchUserDiscount" })),
}));

const mockCookieGet = Cookies.get as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockMessageError = message.error as jest.Mock;

function resetState(overrides: Record<string, any> = {}) {
  mockState = {
    billing: {
      balanceDetail: {
        availableCredit: "12.34",
        status: "success",
      },
    },
    config: {
      enterprise: {
        isWhiteListUser: true,
      },
    },
    user: {
      allTeamMembers: [],
      currentTeam: null,
      email: "user@example.com",
      username: "User",
      uuid: "uuid-1",
    },
    ...overrides,
  };
}

describe("useHeaderAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetState();
    mockCookieGet.mockReturnValue("token-1");
    mockUsePathname.mockReturnValue("/en/models-console/library");
    mockUseRouter.mockReturnValue({ push: mockRouterPush });
    window.location.hash = "";
  });

  it("returns auth state and fetches session, billing and team data when token exists", async () => {
    resetState({
      ...mockState,
      user: {
        ...mockState.user,
        currentTeam: { id: "team-1" },
      },
    });

    const { result } = renderHook(() => useHeaderAuth());

    await waitFor(() => {
      expect(fetchUserDiscount).toHaveBeenCalled();
      expect(fetchUserInfo).toHaveBeenCalled();
      expect(fetchBalanceDetail).toHaveBeenCalled();
      expect(fetchEnterprise).toHaveBeenCalled();
      expect(fetchAllTeamMembers).toHaveBeenCalled();
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "user/fetchUserInfo" });
    expect(result.current).toMatchObject({
      availableCredit: "12.34",
      balanceStatus: "success",
      email: "user@example.com",
      enterprise: true,
      isLogin: true,
      username: "User",
      uuid: "uuid-1",
    });
  });

  it("marks the user logged out and redirects protected paths once when token is missing", async () => {
    resetState({
      ...mockState,
      user: {
        ...mockState.user,
        uuid: "",
      },
    });
    mockCookieGet.mockReturnValue(undefined);
    window.location.hash = "#usage";

    const { rerender, result } = renderHook(() => useHeaderAuth());

    await waitFor(() => {
      expect(setUserState).toHaveBeenCalledWith(UserState.logout);
      expect(mockMessageError).toHaveBeenCalledWith("Please log in first");
      expect(mockRouterPush).toHaveBeenCalledWith(
        "/en/user/login?redirect=%2Fen%2Fmodels-console%2Flibrary%23usage",
      );
    });

    rerender();

    expect(result.current.isLogin).toBe(false);
    expect(mockMessageError).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: UserState.logout,
      type: "user/setState",
    });
  });
});
