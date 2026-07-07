const mockCookiesGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: () => ({ get: mockCookiesGet }),
}));

import { getTokenCookie } from "@/lib/server";

describe("getTokenCookie", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the token cookie value when present", () => {
    mockCookiesGet.mockReturnValue({ value: "tok-123" });
    expect(getTokenCookie()).toBe("tok-123");
    expect(mockCookiesGet).toHaveBeenCalledWith("token");
  });

  it("returns an empty string when the cookie is absent", () => {
    mockCookiesGet.mockReturnValue(undefined);
    expect(getTokenCookie()).toBe("");
  });
});
