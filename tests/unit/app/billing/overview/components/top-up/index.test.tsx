import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Topup } from "@/app/billing/overview/components/top-up/index";
import { message } from "@/components/ui/standard/notify";
import { showPermissionMessage } from "@/lib/utils/permission";
import { useTopup } from "@/app/billing/lib/hooks/topup";

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/lib/utils/permission", () => ({
  showPermissionMessage: jest.fn(),
}));

let mockHasPermission = true;
jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: () => mockHasPermission,
}));

const mockTopupByStripeLink = jest.fn();
let mockIsLoading = false;
jest.mock("@/app/billing/lib/hooks/topup", () => ({
  useTopup: jest.fn(),
}));

jest.mock(
  "@/app/billing/overview/components/top-up/TopupWithCardModal",
  () => ({
    TopupWithCardModal: ({ open, price }: any) =>
      open ? <div role="dialog">card modal ${price}</div> : null,
  }),
);

const mockUseTopup = useTopup as jest.Mock;

describe("Topup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHasPermission = true;
    mockIsLoading = false;
    mockTopupByStripeLink.mockResolvedValue("https://stripe/session");
    mockUseTopup.mockImplementation(() => ({
      topupByStripeLink: mockTopupByStripeLink,
      isLoading: mockIsLoading,
    }));
    localStorage.clear();
  });

  it("renders the default price and Top Up button", () => {
    render(<Topup />);
    expect(screen.getByText("Top-Up Credit")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByText("Top Up")).toBeInTheDocument();
  });

  it("shows Redirecting label while loading", () => {
    mockIsLoading = true;
    render(<Topup />);
    expect(screen.getByText("Redirecting...")).toBeInTheDocument();
  });

  it("warns and blocks when there is no permission", async () => {
    mockHasPermission = false;
    render(<Topup />);
    fireEvent.click(screen.getByText("Top Up"));
    await waitFor(() => {
      expect(showPermissionMessage).toHaveBeenCalled();
    });
    expect(mockTopupByStripeLink).not.toHaveBeenCalled();
  });

  it("warns when amount is empty", async () => {
    render(<Topup />);
    fireEvent.change(screen.getByDisplayValue("10"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByText("Top Up"));
    await waitFor(() => {
      expect(message.warning).toHaveBeenCalledWith(
        "Please enter the amount to top up.",
      );
    });
  });

  it("warns when amount is not an integer", async () => {
    render(<Topup />);
    fireEvent.change(screen.getByDisplayValue("10"), {
      target: { value: "10.5" },
    });
    fireEvent.click(screen.getByText("Top Up"));
    await waitFor(() => {
      expect(message.warning).toHaveBeenCalledWith("Price must be an integer.");
    });
  });

  it("warns when amount is below the minimum", async () => {
    render(<Topup />);
    fireEvent.change(screen.getByDisplayValue("10"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByText("Top Up"));
    await waitFor(() => {
      expect(message.warning).toHaveBeenCalledWith(
        "The minimum top-up amount is $10",
      );
    });
  });

  it("warns when amount exceeds the maximum", async () => {
    render(<Topup />);
    fireEvent.change(screen.getByDisplayValue("10"), {
      target: { value: "1000000" },
    });
    fireEvent.click(screen.getByText("Top Up"));
    await waitFor(() => {
      expect(message.warning).toHaveBeenCalledWith(
        expect.stringContaining("cannot exceed"),
      );
    });
  });

  it("redirects to the stripe session when no card is bound", async () => {
    delete (window as any).location;
    (window as any).location = { href: "" };
    render(<Topup />);
    fireEvent.change(screen.getByDisplayValue("10"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByText("Top Up"));
    await waitFor(() => {
      expect(mockTopupByStripeLink).toHaveBeenCalledWith(50, expect.anything());
      expect(window.location.href).toBe("https://stripe/session");
    });
  });

  it("opens the card modal when a card is bound", async () => {
    render(
      <Topup paymentMethodData={{ cardsInfo: [{ id: "card-1" }] } as any} />,
    );
    fireEvent.change(screen.getByDisplayValue("10"), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByText("Top Up"));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(mockTopupByStripeLink).not.toHaveBeenCalled();
  });
});
