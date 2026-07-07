const mockState = {
  config: { notice: undefined as unknown },
};
let mockPathname = "/";

jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
}));
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import { useIsNoticeShowing } from "@/lib/hooks/useIsNoticeShowing";
import { renderHook } from "@testing-library/react";

describe("useIsNoticeShowing", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockState.config.notice = undefined;
  });

  it("returns false when there is no notice config", () => {
    const { result } = renderHook(() => useIsNoticeShowing());
    expect(result.current).toBe(false);
  });

  it("returns false when notice.show is false", () => {
    mockState.config.notice = { show: false };
    const { result } = renderHook(() => useIsNoticeShowing());
    expect(result.current).toBe(false);
  });

  it("returns true when notice should show on a normal path", () => {
    mockState.config.notice = { show: true, showInConsole: true };
    const { result } = renderHook(() => useIsNoticeShowing());
    expect(result.current).toBe(true);
  });

  it("returns false in console when showInConsole is false", () => {
    mockState.config.notice = { show: true, showInConsole: false };
    const { result } = renderHook(() => useIsNoticeShowing(true));
    expect(result.current).toBe(false);
  });

  it("returns false on a disabled notice URL", () => {
    mockPathname = "/referral/abc";
    mockState.config.notice = { show: true, showInConsole: true };
    const { result } = renderHook(() => useIsNoticeShowing());
    expect(result.current).toBe(false);
  });
});
