import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import StripeInfoManage from "@/app/billing/billing-transactions/components/StripeInfoManage";
import { updateStripeCustomerPortal } from "@/api/buy";

jest.mock("@/api/buy", () => ({
  updateStripeCustomerPortal: jest.fn(),
}));

const mockPortal = updateStripeCustomerPortal as jest.Mock;

describe("StripeInfoManage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();
  });

  it("renders the update button", () => {
    render(<StripeInfoManage />);
    expect(screen.getByText("Update billing info")).toBeInTheDocument();
  });

  it("opens the stripe customer portal in a new tab", async () => {
    mockPortal.mockResolvedValue({ url: "https://portal" });
    render(<StripeInfoManage />);
    fireEvent.click(screen.getByText("Update billing info"));
    await waitFor(() => {
      expect(mockPortal).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith("https://portal", "_blank");
    });
  });

  it("recovers from a portal error without throwing", async () => {
    mockPortal.mockRejectedValue(new Error("nope"));
    render(<StripeInfoManage />);
    fireEvent.click(screen.getByText("Update billing info"));
    await waitFor(() => {
      expect(mockPortal).toHaveBeenCalled();
    });
    expect(window.open).not.toHaveBeenCalled();
  });
});
