jest.mock("@/lib/utils/user", () => ({
  checkServerlessAccess: jest.fn(),
}));

import { GetIsServerlessAuth } from "@/lib/utils/serverlessAuth";
import { checkServerlessAccess } from "@/lib/utils/user";

const mockCheckServerlessAccess = checkServerlessAccess as jest.Mock;

describe("GetIsServerlessAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns false without checking access for logged-out users", () => {
    expect(
      GetIsServerlessAuth(false, "15500000000", "user@example.com", "uuid-1"),
    ).toBe(false);

    expect(mockCheckServerlessAccess).not.toHaveBeenCalled();
  });

  it("delegates logged-in access checks with user identifiers", () => {
    mockCheckServerlessAccess.mockReturnValue(true);

    expect(
      GetIsServerlessAuth(true, "15500000000", "user@example.com", "uuid-1"),
    ).toBe(true);

    expect(mockCheckServerlessAccess).toHaveBeenCalledWith({
      email: "user@example.com",
      mobilePhone: "15500000000",
      uuid: "uuid-1",
    });
  });
});
