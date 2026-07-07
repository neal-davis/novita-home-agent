import { fireEvent, render, screen } from "@testing-library/react";
import ConsoleNavSwitcher from "@/app/components/header/partials/ConsoleNavSwitcher";

let mockPathname = "/models-console";
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (link: string) => link,
  getPathnameWithoutLocale: (p: string) => p,
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) => a.filter(Boolean).join(" "),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <button
        data-testid="go-gpu"
        onClick={() => onValueChange("gpu-instance")}
      >
        gpu
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
  SelectValue: () => <span>value</span>,
}));

describe("ConsoleNavSwitcher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = "/models-console";
  });

  it("renders nothing outside of console routes", () => {
    mockPathname = "/pricing";
    const { container } = render(<ConsoleNavSwitcher />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all console route options on a console route", () => {
    render(<ConsoleNavSwitcher />);
    expect(screen.getByText("Model APIs")).toBeInTheDocument();
    expect(screen.getByText("Agent Sandbox")).toBeInTheDocument();
    expect(screen.getByText("GPUs")).toBeInTheDocument();
  });

  it("selects model-api as the active route on a models-console path", () => {
    render(<ConsoleNavSwitcher />);
    expect(screen.getByTestId("select")).toHaveAttribute(
      "data-value",
      "model-api",
    );
  });

  it("navigates to the chosen route's link on change", () => {
    render(<ConsoleNavSwitcher />);
    fireEvent.click(screen.getByTestId("go-gpu"));
    expect(mockPush).toHaveBeenCalledWith("/gpus-console/application");
  });
});
