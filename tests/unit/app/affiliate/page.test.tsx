const mockRedirect = jest.fn();
jest.mock("next/navigation", () => ({
  redirect: (...a: unknown[]) => mockRedirect(...a),
}));

import Page from "@/app/affiliate/page";

describe("affiliate/page", () => {
  beforeEach(() => jest.clearAllMocks());

  it("redirects to the new affiliate page", () => {
    Page();
    expect(mockRedirect).toHaveBeenCalledWith("/affiliate-new");
  });
});
