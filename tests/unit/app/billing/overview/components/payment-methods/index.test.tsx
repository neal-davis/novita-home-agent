import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { PaymentMethods } from "@/app/billing/overview/components/payment-methods/index";
import { showPermissionMessage } from "@/lib/utils/permission";

jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));

let mockHasPermission = true;
jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => mockHasPermission,
}));

jest.mock(
  "@/app/billing/overview/components/payment-methods/PaymentInfo",
  () => ({
    __esModule: true,
    default: ({ addCard, delCard, isLoading }: any) => (
      <div>
        <span>info loading {String(isLoading)}</span>
        <button type="button" onClick={addCard}>
          info add
        </button>
        <button type="button" onClick={() => delCard("card-1")}>
          info del
        </button>
      </div>
    ),
  }),
);

jest.mock("@/app/billing/overview/components/payment-methods/CardItem", () => ({
  CardItem: (props: any) => <div data-testid="card-item">{props.last4}</div>,
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

const card = {
  brand: "visa",
  last4: "4242",
  expMonth: "12",
  expYear: "2030",
  id: "card-1",
} as any;

const makePmData = (overrides: any = {}) => ({
  cardsInfo: [card],
  isLoading: false,
  addPaymentMethod: jest.fn().mockResolvedValue({ url: "https://add" }),
  delPaymentMethod: jest.fn(),
  fetchPaymentMethod: jest.fn(),
  ...overrides,
});

describe("PaymentMethods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPermission = true;
    localStorage.clear();
  });

  it("renders the non-compact PaymentInfo view", () => {
    render(<PaymentMethods paymentMethodData={makePmData()} />);
    expect(screen.getByText("info loading false")).toBeInTheDocument();
  });

  it("compact view shows the bound card and a Remove button", () => {
    render(<PaymentMethods paymentMethodData={makePmData()} compact />);
    expect(screen.getByText("visa****4242")).toBeInTheDocument();
    expect(screen.getByText("Exp 12/2030")).toBeInTheDocument();
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  it("compact view shows Add card when no card is bound", () => {
    render(
      <PaymentMethods
        paymentMethodData={makePmData({ cardsInfo: [] })}
        compact
      />,
    );
    expect(screen.getByText("No payment method")).toBeInTheDocument();
    expect(screen.getByText("Add card")).toBeInTheDocument();
  });

  it("adds a card by redirecting to the returned url", async () => {
    delete (window as any).location;
    (window as any).location = { href: "" };
    const data = makePmData({ cardsInfo: [] });
    render(<PaymentMethods paymentMethodData={data} compact />);

    fireEvent.click(screen.getByText("Add card"));
    await waitFor(() => {
      expect(data.addPaymentMethod).toHaveBeenCalled();
      expect(window.location.href).toBe("https://add");
    });
  });

  it("blocks add card without permission", async () => {
    mockHasPermission = false;
    const data = makePmData({ cardsInfo: [] });
    render(<PaymentMethods paymentMethodData={data} compact />);

    fireEvent.click(screen.getByText("Add card"));
    await waitFor(() => {
      expect(showPermissionMessage).toHaveBeenCalled();
    });
    expect(data.addPaymentMethod).not.toHaveBeenCalled();
  });

  it("opens the delete dialog and confirms removal", async () => {
    const data = makePmData();
    render(<PaymentMethods paymentMethodData={data} compact />);

    fireEvent.click(screen.getByText("Remove"));
    expect(
      screen.getByText("Confirmation of Card Deletion"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Remove card"));
    await waitFor(() => {
      expect(data.delPaymentMethod).toHaveBeenCalledWith("card-1");
    });
  });

  it("closes the delete dialog on Cancel without deleting", async () => {
    const data = makePmData();
    render(<PaymentMethods paymentMethodData={data} compact />);

    fireEvent.click(screen.getByText("Remove"));
    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(
        screen.queryByText("Confirmation of Card Deletion"),
      ).not.toBeInTheDocument();
    });
    expect(data.delPaymentMethod).not.toHaveBeenCalled();
  });
});
