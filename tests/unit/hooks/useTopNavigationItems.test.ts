const mockState = { user: { uuid: "" } };
jest.mock("@/store", () => ({
  useAppSelector: (sel: (s: typeof mockState) => unknown) => sel(mockState),
}));
jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

import { useTopNavigationItems } from "@/hooks/useTopNavigationItems";
import { renderHook } from "@testing-library/react";

describe("useTopNavigationItems", () => {
  beforeEach(() => {
    mockState.user.uuid = "";
  });

  it("returns index menu + pricing + others for the default (non-console) page", () => {
    const { result } = renderHook(() => useTopNavigationItems());
    const keys = result.current.map((i) => i.key);
    expect(keys).toContain("model_library");
    expect(keys).toContain("pricing");
    expect(keys).toContain("docs");
    // logged out: no console entry
    expect(keys).not.toContain("console");
  });

  it("adds a console entry on the index page when logged in", () => {
    mockState.user.uuid = "user-1";
    const { result } = renderHook(() => useTopNavigationItems());
    expect(result.current.map((i) => i.key)).toContain("console");
  });

  it("returns console menu items + billing for the console page", () => {
    const { result } = renderHook(() => useTopNavigationItems("console"));
    const keys = result.current.map((i) => i.key);
    expect(keys).toContain("model_api_console");
    expect(keys).toContain("billing");
    // console page should not show the public model_library/pricing entries
    expect(keys).not.toContain("model_library");
    expect(keys).not.toContain("pricing");
  });
});
