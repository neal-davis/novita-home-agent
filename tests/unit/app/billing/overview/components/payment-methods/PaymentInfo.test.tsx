import { render, screen, fireEvent } from "@testing-library/react";
import PaymentInfo from "@/app/billing/overview/components/payment-methods/PaymentInfo";
import { CardInfoContext } from "@/app/billing/overview/components/payment-methods/CardInfoContext";

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    BILLING: new Proxy({}, { get: (_t: any, p: any) => String(p) }),
  },
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: Object.assign(() => <div data-testid="skeleton" />, {
    Button: (p: any) => <div data-testid="skeleton-button" {...p} />,
  }),
}));

jest.mock(
  "@/app/billing/overview/components/payment-methods/index.module.scss",
  () => ({}),
  { virtual: true },
);

const renderWith = (cardsInfo: any, props: any) =>
  render(
    <CardInfoContext.Provider value={{ cardsInfo }}>
      <PaymentInfo {...props} />
    </CardInfoContext.Provider>,
  );

describe("PaymentInfo", () => {
  it("shows a skeleton while loading", () => {
    renderWith(null, {
      isLoading: true,
      delCard: jest.fn(),
      addCard: jest.fn(),
    });
    expect(screen.getByTestId("skeleton-button")).toBeInTheDocument();
  });

  it("renders the current card and removes it on click", () => {
    const delCard = jest.fn();
    renderWith(
      [
        {
          id: "card-1",
          brand: "Visa",
          last4: "4242",
          expMonth: 5,
          expYear: 2031,
        },
      ],
      { isLoading: false, delCard, addCard: jest.fn() },
    );
    expect(screen.getByText("Current Payment Method")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Remove Payment Method"));
    expect(delCard).toHaveBeenCalledWith("card-1");
  });

  it("renders the empty state and adds a card on click", () => {
    const addCard = jest.fn();
    renderWith([], { isLoading: false, delCard: jest.fn(), addCard });
    expect(screen.getByText("Payment Methods")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Add Payment Method"));
    expect(addCard).toHaveBeenCalled();
  });

  it("treats a null cards value as empty state", () => {
    renderWith(null, {
      isLoading: false,
      delCard: jest.fn(),
      addCard: jest.fn(),
    });
    expect(screen.getByText("Add Payment Method")).toBeInTheDocument();
  });

  it("hides the voucher hint when not eligible", () => {
    renderWith([], {
      isLoading: false,
      delCard: jest.fn(),
      addCard: jest.fn(),
      welcomeVoucherEligible: false,
    });
    expect(
      screen.queryByText("Bind a card to receive a $1 Model API Voucher"),
    ).not.toBeInTheDocument();
  });

  it("shows the voucher hint when eligible", () => {
    renderWith([], {
      isLoading: false,
      delCard: jest.fn(),
      addCard: jest.fn(),
      welcomeVoucherEligible: true,
    });
    expect(
      screen.getByText("Bind a card to receive a $1 Model API Voucher"),
    ).toBeInTheDocument();
  });
});
