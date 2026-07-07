import { renderHook } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoginGuard } from "@/app/models-console/llm-playground/hooks/useLoginGuard";

let mockUuid: string | undefined;
jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel({ user: { uuid: mockUuid } }),
}));

const push = jest.fn();

beforeEach(() => {
  push.mockClear();
  (useRouter as jest.Mock).mockReturnValue({ push });
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("a=1"));
});

describe("useLoginGuard", () => {
  it("reports logged in and passes the guard when a uuid exists", () => {
    mockUuid = "user-1";
    const { result } = renderHook(() => useLoginGuard());
    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.checkLogin()).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });

  it("redirects to login with an encoded redirect when no uuid", () => {
    mockUuid = undefined;
    const { result } = renderHook(() => useLoginGuard());
    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.checkLogin()).toBe(false);
    expect(push).toHaveBeenCalledTimes(1);
    const target = push.mock.calls[0][0] as string;
    expect(target).toContain("redirect=");
    // path "/" plus query a=1 should be encoded into the redirect
    expect(target).toContain(encodeURIComponent("/?a=1"));
  });
});
