import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TopupWithCardModal } from "@/app/billing/overview/components/top-up/TopupWithCardModal";
import { useTopup } from "@/app/billing/lib/hooks/topup";

const mockDispatch = jest.fn();
let mockConfigState: any;
let mockUserState: any;

jest.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: (s: any) => unknown) =>
    sel({ config: mockConfigState, user: mockUserState }),
}));

jest.mock("@/store/slice/billingSlice", () => ({
  fetchBalanceDetail: () => ({ type: "fetchBalanceDetail" }),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/app/billing/overview/components/payment-methods/CardItem", () => ({
  CardItem: (props: any) => (
    <div data-testid="card-item">card {props.last4}</div>
  ),
}));

const mockTopupWithCard = jest.fn();
const mockTopupByStripeLink = jest.fn();
let mockIsLoading = false;
jest.mock("@/app/billing/lib/hooks/topup", () => ({
  useTopup: jest.fn(),
}));

const mockUseTopup = useTopup as jest.Mock;

const carInfo = { id: "card-1", last4: "4242", brand: "visa" } as any;

describe("TopupWithCardModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockConfigState = { discount: { valid: false, percentOff: 0 } };
    mockUserState = { currentTeam: null };
    mockUseTopup.mockImplementation(() => ({
      topupWidthCard: mockTopupWithCard,
      topupByStripeLink: mockTopupByStripeLink,
      isLoading: mockIsLoading,
    }));
  });

  it("does not render when closed", () => {
    render(
      <TopupWithCardModal
        price={50}
        open={false}
        onClose={jest.fn()}
        redirectPath="/billing"
      />,
    );
    expect(screen.queryByText("Top-Up Credit")).not.toBeInTheDocument();
  });

  it("renders amount and stripe checkout button", () => {
    render(
      <TopupWithCardModal
        price={50}
        open
        onClose={jest.fn()}
        redirectPath="/billing"
      />,
    );
    expect(screen.getByText("Top-Up Credit")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("Stripe Checkout")).toBeInTheDocument();
  });

  it("shows team account information when currentTeam present", () => {
    mockUserState = { currentTeam: { id: "team-9", name: "Acme" } };
    render(
      <TopupWithCardModal
        price={50}
        open
        onClose={jest.fn()}
        redirectPath="/billing"
      />,
    );
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Team ID: team-9")).toBeInTheDocument();
  });

  it("renders the card payment button and CardItem when a card is provided", () => {
    render(
      <TopupWithCardModal
        price={50}
        carInfo={carInfo}
        open
        onClose={jest.fn()}
        redirectPath="/billing"
      />,
    );
    expect(screen.getByTestId("card-item")).toBeInTheDocument();
    expect(screen.getByText(/Pay with ••••4242/)).toBeInTheDocument();
  });

  it("shows discounted payment amount when a discount is valid", () => {
    mockConfigState = { discount: { valid: true, percentOff: 20 } };
    render(
      <TopupWithCardModal
        price={100}
        open
        onClose={jest.fn()}
        redirectPath="/billing"
      />,
    );
    // 100 * (1 - 0.2) = 80
    expect(screen.getByText("$80")).toBeInTheDocument();
  });

  it("pays with the saved card and dispatches balance refresh on success", async () => {
    mockTopupWithCard.mockImplementation(({ succCb }: any) => {
      succCb.forEach((cb: any) => cb());
    });
    render(
      <TopupWithCardModal
        price={50}
        carInfo={carInfo}
        open
        onClose={jest.fn()}
        redirectPath="/billing"
      />,
    );
    fireEvent.click(screen.getByText(/Pay with ••••4242/));
    await waitFor(() => {
      expect(mockTopupWithCard).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 50, paymentMethodId: "card-1" }),
      );
      expect(mockDispatch).toHaveBeenCalled();
      // Success view
      expect(
        screen.getByText("The credit top-up of $50 was successful."),
      ).toBeInTheDocument();
    });
  });

  it("redirects to the stripe session on Stripe Checkout", async () => {
    mockTopupByStripeLink.mockResolvedValue("https://stripe/session");
    delete (window as any).location;
    (window as any).location = { href: "" };
    render(
      <TopupWithCardModal
        price={50}
        open
        onClose={jest.fn()}
        redirectPath="/billing"
      />,
    );
    fireEvent.click(screen.getByText("Stripe Checkout"));
    await waitFor(() => {
      expect(mockTopupByStripeLink).toHaveBeenCalledWith(50, "/billing");
      expect(window.location.href).toBe("https://stripe/session");
    });
  });

  it("calls onClose from Cancel", () => {
    const onClose = jest.fn();
    render(
      <TopupWithCardModal
        price={50}
        open
        onClose={onClose}
        redirectPath="/billing"
      />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalled();
  });
});
