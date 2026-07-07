import { act, renderHook } from "@testing-library/react";
import {
  CONSOLE_ORI_HEADER_HEIGHT,
  getCustomNoticeHeight,
  NOTICE_DESKTOP_HEIGHT,
  NOTICE_MOBILE_HEIGHT,
  ORI_HEADER_HEIGHT,
  useHeaderHeight,
  useNoticeHeight,
} from "@/hooks/useHeaderHeight";
import { useIsInConsole } from "@/hooks/useIsInConsole";
import { useIsMobile } from "@/hooks/useIsMobile";
import usePrevious from "@/lib/hooks/usePrevious";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
import { useIsNoticeShowing } from "@/lib/hooks/useIsNoticeShowing";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";

const mockState = {
  config: {
    isMobile: false,
    notice: {} as Record<string, any>,
  },
};
const mockDispatch = jest.fn();
const setIsMobile = jest.fn((value: boolean) => ({
  payload: value,
  type: "config/setIsMobile",
}));
const mobileCheck = jest.fn();

jest.mock("@/store", () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
  useAppSelector: jest.fn((selector) => selector(mockState)),
}));

jest.mock("@/store/slice/configSlice", () => ({
  setIsMobile: jest.fn((value: boolean) => setIsMobile(value)),
}));

jest.mock("@/lib/utils/utils", () => ({
  mobileCheck: jest.fn(() => mobileCheck()),
}));

jest.mock("@/lib/hooks/useIsNoticeShowing", () => ({
  useIsNoticeShowing: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/i18n/config", () => ({
  getPathnameWithoutLocale: jest.fn((pathname: string) =>
    pathname.replace(/^\/[a-z]{2}(?=\/)/, ""),
  ),
}));

jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

const mockUseIsNoticeShowing = useIsNoticeShowing as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;
const mockCookieGet = Cookies.get as jest.Mock;

function installMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    addEventListener: jest.fn((_event: string, listener) => {
      listeners.add(listener);
    }),
    matches,
    removeEventListener: jest.fn((_event: string, listener) => {
      listeners.delete(listener);
    }),
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: jest.fn(() => mediaQuery),
  });

  return {
    mediaQuery,
    setMatches(nextMatches: boolean) {
      mediaQuery.matches = nextMatches;
      listeners.forEach((listener) =>
        listener({ matches: nextMatches } as MediaQueryListEvent),
      );
    },
  };
}

describe("header height hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.config.notice = {};
    mockUseIsNoticeShowing.mockReturnValue(true);
    installMatchMedia(false);
  });

  it("chooses explicit and configured notice heights", () => {
    expect(getCustomNoticeHeight(72, 88)).toBe(72);
    expect(getCustomNoticeHeight(undefined, 88)).toBe(88);
    expect(
      getCustomNoticeHeight(undefined, NOTICE_DESKTOP_HEIGHT),
    ).toBeUndefined();
  });

  it("returns responsive notice height and cleans up media query listeners", () => {
    const { mediaQuery, setMatches } = installMatchMedia(false);

    const { result, unmount } = renderHook(() => useNoticeHeight());

    expect(result.current).toBe(NOTICE_DESKTOP_HEIGHT);

    act(() => {
      setMatches(true);
    });
    expect(result.current).toBe(NOTICE_MOBILE_HEIGHT);

    unmount();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("combines notice and original header heights by page type", () => {
    mockState.config.notice = { height: 88 };

    const { result, rerender } = renderHook(
      ({ hideNotice, page, position }) =>
        useHeaderHeight(page as any, position as any, hideNotice),
      {
        initialProps: {
          hideNotice: false,
          page: "console",
          position: "relative",
        },
      },
    );

    expect(result.current).toEqual({
      headerHeight: CONSOLE_ORI_HEADER_HEIGHT + 88,
      isNoticeShowing: true,
      noticeHeight: 88,
      originalHeaderHeight: CONSOLE_ORI_HEADER_HEIGHT,
    });

    rerender({ hideNotice: true, page: "playground", position: "relative" });
    expect(result.current).toMatchObject({
      headerHeight: ORI_HEADER_HEIGHT,
      isNoticeShowing: false,
      noticeHeight: 0,
      originalHeaderHeight: ORI_HEADER_HEIGHT,
    });
  });
});

describe("small shared hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.config.isMobile = false;
    mobileCheck.mockReturnValue(false);
    mockCookieGet.mockReturnValue(undefined);
  });

  it("detects console pathnames after removing locale prefixes", () => {
    mockUsePathname.mockReturnValue("/en/gpus-console/instances");
    expect(renderHook(() => useIsInConsole()).result.current).toBe(true);

    mockUsePathname.mockReturnValue("/models/llm/chat");
    expect(renderHook(() => useIsInConsole()).result.current).toBe(true);

    mockUsePathname.mockReturnValue("/pricing");
    expect(renderHook(() => useIsInConsole()).result.current).toBe(false);

    mockUsePathname.mockReturnValue("");
    expect(renderHook(() => useIsInConsole()).result.current).toBe(false);
  });

  it("dispatches mobile state on timeout and resize", () => {
    jest.useFakeTimers();
    mobileCheck.mockReturnValue(true);

    const { unmount } = renderHook(() => useIsMobile());

    expect(renderHook(() => useIsMobile()).result.current).toBe(false);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(setIsMobile).toHaveBeenCalledWith(true);
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: true,
      type: "config/setIsMobile",
    });

    mobileCheck.mockReturnValue(false);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(setIsMobile).toHaveBeenLastCalledWith(false);

    unmount();
    jest.useRealTimers();
  });

  it("returns the previous value after rerender", () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: "first" },
    });

    expect(result.current).toBeUndefined();
    rerender({ value: "second" });
    expect(result.current).toBe("first");
    rerender({ value: "third" });
    expect(result.current).toBe("second");
  });

  it("uses the auth token as a session cache key", () => {
    mockCookieGet.mockReturnValue("token-1");
    expect(renderHook(() => useSelectKeys()).result.current).toEqual([
      "session_token-1",
    ]);

    mockCookieGet.mockReturnValue(undefined);
    expect(renderHook(() => useSelectKeys()).result.current).toEqual([]);
  });
});
