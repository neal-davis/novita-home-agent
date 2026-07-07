const mockUsePermission = jest.fn();
const mockIsCodingPlanCampaignActive = jest.fn();

jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: (...a: unknown[]) => mockUsePermission(...a),
}));
jest.mock("@/lib/utils/codingPlanCampaign", () => ({
  isCodingPlanCampaignActive: () => mockIsCodingPlanCampaignActive(),
}));

import { useSideNavigationItems } from "@/hooks/useSideNavigationItems";
import { renderHook } from "@testing-library/react";

describe("useSideNavigationItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePermission.mockReturnValue(true);
    mockIsCodingPlanCampaignActive.mockReturnValue(true);
  });

  it("returns main nav items for the 'main' product", () => {
    const { result } = renderHook(() => useSideNavigationItems("main"));
    const keys = result.current.map((i) => i.key);
    expect(keys).toContain("home");
    expect(keys).toContain("billing");
  });

  it("returns models nav items", () => {
    const { result } = renderHook(() => useSideNavigationItems("models"));
    expect(result.current.map((i) => i.key)).toContain("model-library");
  });

  it("returns gpus nav items", () => {
    const { result } = renderHook(() => useSideNavigationItems("gpus"));
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("returns sandbox nav items", () => {
    const { result } = renderHook(() => useSideNavigationItems("sandbox"));
    expect(result.current.map((i) => i.key)).toContain("template");
  });

  it("includes coding-plan in billing nav when the campaign is active", () => {
    mockIsCodingPlanCampaignActive.mockReturnValue(true);
    const { result } = renderHook(() => useSideNavigationItems("billing"));
    expect(result.current.map((i) => i.key)).toContain("coding-plan");
  });

  it("hides coding-plan in billing nav when the campaign is inactive", () => {
    mockIsCodingPlanCampaignActive.mockReturnValue(false);
    const { result } = renderHook(() => useSideNavigationItems("billing"));
    expect(result.current.map((i) => i.key)).not.toContain("coding-plan");
  });

  it("returns an empty list for an unknown product", () => {
    const { result } = renderHook(() =>
      useSideNavigationItems("unknown" as never),
    );
    expect(result.current).toEqual([]);
  });
});
