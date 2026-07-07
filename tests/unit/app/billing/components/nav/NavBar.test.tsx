import { fireEvent, render, screen } from "@testing-library/react";
import { NavBar, NavItem } from "@/app/billing/components/nav/NavBar";

const mockPush = jest.fn();
let mockPathname = "/billing/overview";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/i18n/config", () => ({
  getPathnameWithoutLocale: (p: string) => p,
  getLocalizedPath: (href: string) => href,
}));

jest.mock("@/i18n/provider", () => ({
  useI18n: () => ({ locale: "en" }),
}));

const options = [
  {
    text: "Overview",
    isSelect: false,
    url: "/billing/overview",
    match: ["/billing/overview"],
  },
  {
    text: "Transactions",
    isSelect: false,
    url: "/billing/billing-transactions",
    match: ["/billing/billing-transactions"],
  },
];

describe("NavItem", () => {
  it("renders text and fires onClick with the item text", () => {
    const onClick = jest.fn();
    render(<NavItem text="Overview" onClick={onClick} />);
    fireEvent.click(screen.getByText("Overview"));
    expect(onClick).toHaveBeenCalledWith("Overview");
  });
});

describe("NavBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/billing/overview";
  });

  it("renders all options", () => {
    render(<NavBar options={options} title="Billing" />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("navigates via router.push on item click", () => {
    render(<NavBar options={options} title="Billing" />);
    fireEvent.click(screen.getByText("Transactions"));
    expect(mockPush).toHaveBeenCalledWith("/billing/billing-transactions");
  });

  it("selects the option whose match contains the current path", () => {
    mockPathname = "/billing/billing-transactions";
    const { container } = render(<NavBar options={options} title="Billing" />);
    // The selected item gets a selected class modifier
    const selected = container.querySelector('[class*="selected"]');
    expect(selected?.textContent).toBe("Transactions");
  });
});
