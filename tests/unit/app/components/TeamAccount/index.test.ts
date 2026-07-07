jest.mock("@/app/components/TeamAccount/TeamAccountWrapper", () => ({
  __esModule: true,
  default: () => null,
}));

import { TeamAccountWrapper } from "@/app/components/TeamAccount";

describe("TeamAccount index barrel", () => {
  it("re-exports TeamAccountWrapper", () => {
    expect(typeof TeamAccountWrapper).toBe("function");
  });
});
