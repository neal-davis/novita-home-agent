jest.mock("@/i18n/config", () => ({
  getPathnameWithoutLocale: jest.fn((path: string) =>
    path.replace(/^\/[a-z]{2}(?=\/)/, ""),
  ),
}));

import {
  clearStack,
  getNavigationStack,
  getPreviousMainPagePath,
  getPreviousPath,
  getProductFromPath,
  getStackLength,
  popFromStack,
  pushToStack,
} from "@/lib/navigationStack";

describe("navigationStack", () => {
  beforeEach(() => {
    clearStack();
  });

  it("pushes unique paths, pops paths and exposes immutable snapshots", () => {
    pushToStack("/models-console/library");
    pushToStack("/models-console/library");
    pushToStack("/billing");

    expect(getStackLength()).toBe(2);
    expect(getPreviousPath()).toBe("/models-console/library");

    const snapshot = getNavigationStack();
    snapshot.push("/mutated");
    expect(getNavigationStack()).toEqual([
      "/models-console/library",
      "/billing",
    ]);

    expect(popFromStack()).toBe("/billing");
    expect(popFromStack()).toBe("/models-console/library");
    expect(popFromStack()).toBeUndefined();
    expect(getPreviousPath()).toBeUndefined();
  });

  it("keeps only the newest ten entries", () => {
    for (let index = 1; index <= 12; index += 1) {
      pushToStack(`/page-${index}`);
    }

    expect(getStackLength()).toBe(10);
    expect(getNavigationStack()).toEqual([
      "/page-3",
      "/page-4",
      "/page-5",
      "/page-6",
      "/page-7",
      "/page-8",
      "/page-9",
      "/page-10",
      "/page-11",
      "/page-12",
    ]);
  });

  it.each([
    ["/en/models-console/library", "models"],
    ["/gpus-console/instances", "gpus"],
    ["/sandbox-console/view", "sandbox"],
    ["/billing/billing-details", "billing"],
    ["/quota-limits/llm", "quota-limits"],
    ["/settings/team", "settings"],
    ["/pricing", "main"],
  ])("maps %s to product %s", (path, expectedProduct) => {
    expect(getProductFromPath(path)).toBe(expectedProduct);
  });

  it("finds the most recent previous path from a different main page section", () => {
    pushToStack("/models-console/library");
    pushToStack("/models-console/metrics");
    pushToStack("/billing/billing-details");
    pushToStack("/gpus-console/instances");

    expect(getPreviousMainPagePath("/gpus-console/explore")).toBe(
      "/billing/billing-details",
    );
    expect(getPreviousMainPagePath("/billing/payment-methods")).toBe(
      "/gpus-console/instances",
    );
    expect(getPreviousMainPagePath("/pricing")).toBe("/gpus-console/instances");
  });

  it("returns undefined when no different main page section exists", () => {
    pushToStack("/models-console/library");
    pushToStack("/models-console/metrics");

    expect(
      getPreviousMainPagePath("/models-console/playground"),
    ).toBeUndefined();
  });
});
