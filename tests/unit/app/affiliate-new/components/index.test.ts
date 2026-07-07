jest.mock("@/app/affiliate-new/components/AffiliateNewPage", () => ({
  AffiliateNewPage: () => null,
}));
jest.mock("@/app/affiliate-new/components/Header", () => ({
  Header: () => null,
}));
jest.mock("@/app/affiliate-new/components/Info", () => ({ Info: () => null }));
jest.mock("@/app/affiliate-new/components/Partners", () => ({
  Partners: () => null,
}));
jest.mock("@/app/affiliate-new/components/Questions", () => ({
  Questions: () => null,
}));
jest.mock("@/app/affiliate-new/components/Recommend", () => ({
  Recommend: () => null,
}));

import * as components from "@/app/affiliate-new/components";

describe("affiliate-new components barrel", () => {
  it("re-exports all named components", () => {
    expect(components.AffiliateNewPage).toBeDefined();
    expect(components.Header).toBeDefined();
    expect(components.Info).toBeDefined();
    expect(components.Partners).toBeDefined();
    expect(components.Questions).toBeDefined();
    expect(components.Recommend).toBeDefined();
  });
});
