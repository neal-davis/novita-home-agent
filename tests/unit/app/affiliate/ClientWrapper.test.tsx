import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";

const getAffiliateInfo = jest.fn();
jest.mock("@/api/user", () => ({
  getAffiliateInfo: (...a: unknown[]) => getAffiliateInfo(...a),
}));

jest.mock("@/app/components/Permission/PermissionWrapper", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

import { ClientWrapper, Context } from "@/app/affiliate/ClientWrapper";

function Probe() {
  const { affiliate, loading } = React.useContext(Context);
  return (
    <div>
      <span data-testid="balance">{affiliate.balance}</span>
      <span data-testid="loading">{String(loading)}</span>
    </div>
  );
}

describe("affiliate ClientWrapper", () => {
  beforeEach(() => jest.clearAllMocks());

  it("loads affiliate info and converts the balance to dollars", async () => {
    getAffiliateInfo.mockResolvedValueOnce({
      referralLink: "r",
      invites: 1,
      clicks: 2,
      balance: 50000,
      password: "p",
    });
    render(
      <ClientWrapper>
        <Probe />
      </ClientWrapper>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("balance").textContent).toBe("5"),
    );
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("exposes the default affiliate values before the request resolves", () => {
    // Never-resolving request keeps the wrapper in its initial state.
    getAffiliateInfo.mockReturnValueOnce(new Promise(() => {}));
    render(
      <ClientWrapper>
        <Probe />
      </ClientWrapper>,
    );
    // loading is flipped to true synchronously in the effect
    expect(screen.getByTestId("loading").textContent).toBe("true");
  });
});
