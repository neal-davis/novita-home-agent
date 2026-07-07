import { fireEvent, render, screen } from "@testing-library/react";
import BalanceBox from "@/app/components/header/partials/BalanceBox";
import { usePermission } from "@/lib/hooks/usePermission";
import analytics from "@/app/components/analytics/analytics";
import { useVoucherModal } from "@/hooks/useVoucherModal";

const mockUsePermission = usePermission as jest.Mock;
const mockUseVoucher = useVoucherModal as jest.Mock;
const mockVoucherOpen = jest.fn();

jest.mock("@/lib/hooks/usePermission", () => ({ usePermission: jest.fn() }));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/hooks/useVoucherModal", () => ({ useVoucherModal: jest.fn() }));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (href: string) => href,
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) => a.filter(Boolean).join(" "),
}));

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({ children }: any) => <button>{children}</button>,
}));
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

describe("BalanceBox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseVoucher.mockReturnValue({
      handleVoucherModalOpen: mockVoucherOpen,
      InjectModalElement: <div data-testid="voucher-modal" />,
      voucherNum: { num: 3 },
    });
  });

  it("renders nothing without balance read permission", () => {
    mockUsePermission.mockReturnValue(false);
    const { container } = render(
      <BalanceBox balance={42} balanceStatus="success" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the balance when status is success", () => {
    mockUsePermission.mockReturnValue(true);
    render(<BalanceBox balance={42} balanceStatus="success" />);
    expect(screen.getAllByText("$42").length).toBeGreaterThan(0);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders a skeleton while balance is loading", () => {
    mockUsePermission.mockReturnValue(true);
    render(<BalanceBox balance={0} balanceStatus={null} />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("opens the voucher modal and tracks the click", () => {
    mockUsePermission.mockReturnValue(true);
    render(<BalanceBox balance={10} balanceStatus="success" />);
    fireEvent.click(screen.getByText("Vouchers"));
    expect(mockVoucherOpen).toHaveBeenCalled();
    expect(analytics.trackClick).toHaveBeenCalled();
  });
});
