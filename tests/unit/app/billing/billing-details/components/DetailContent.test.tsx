import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import DetailContent from "@/app/billing/billing-details/components/DetailContent";

let mockCurrentTeam: any = "team-1";

jest.mock("@/store", () => ({
  useAppSelector: (selector: (state: any) => unknown) =>
    selector({ user: { currentTeam: mockCurrentTeam } }),
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: { BILLING: new Proxy({}, { get: (_t, p) => String(p) }) },
}));

jest.mock("lucide-react", () => ({
  InfoIcon: () => <span data-testid="info-icon" />,
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

// Tabs mock: render all children so each TabsContent table mounts
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, onClick }: any) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

// CategoryTabs drives the billing method switch
jest.mock("@/app/billing/billing-details/components/CategoryTabs", () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <div>
      <button type="button" onClick={() => onChange("OnDemand")}>
        cat OnDemand
      </button>
      <button type="button" onClick={() => onChange("Monthly")}>
        cat Monthly
      </button>
      <button type="button" onClick={() => onChange("MultiDimension")}>
        cat MultiDimension
      </button>
      <button type="button" onClick={() => onChange("Enterprise")}>
        cat Enterprise
      </button>
    </div>
  ),
}));

jest.mock("@/app/billing/billing-details/components/LLMTable", () => ({
  __esModule: true,
  default: () => <div>LLMTable</div>,
}));
jest.mock("@/app/billing/billing-details/components/GPUInstanceTable", () => ({
  __esModule: true,
  default: () => <div>GPUInstanceTable</div>,
}));
jest.mock("@/app/billing/billing-details/components/ServerlessTable", () => ({
  __esModule: true,
  default: () => <div>ServerlessTable</div>,
}));
jest.mock(
  "@/app/billing/billing-details/components/NetworkStorageTable",
  () => ({
    __esModule: true,
    default: () => <div>NetworkStorageTable</div>,
  }),
);
jest.mock("@/app/billing/billing-details/components/EnterpriseTable", () => ({
  __esModule: true,
  default: () => <div>EnterpriseTable</div>,
}));
jest.mock("@/app/billing/billing-details/components/PurcherTable", () => ({
  __esModule: true,
  default: () => <div>PurcherTable</div>,
}));
jest.mock("@/app/billing/billing-details/components/GenAPITable", () => ({
  __esModule: true,
  default: () => <div>GenAPITable</div>,
}));
jest.mock("@/app/billing/billing-details/components/SummaryTable", () => ({
  __esModule: true,
  default: () => <div>SummaryTable</div>,
}));
jest.mock(
  "@/app/billing/billing-details/components/SummaryTableMonthly",
  () => ({
    __esModule: true,
    default: () => <div>SummaryTableMonthly</div>,
  }),
);
jest.mock(
  "@/app/billing/billing-details/components/GPUInstanceTableMonthly",
  () => ({
    __esModule: true,
    default: () => <div>GPUInstanceTableMonthly</div>,
  }),
);
jest.mock(
  "@/app/billing/billing-details/components/NetworkStorageTableMonthly",
  () => ({
    __esModule: true,
    default: () => <div>NetworkStorageTableMonthly</div>,
  }),
);
jest.mock(
  "@/app/billing/billing-details/components/ImageDedicatedEndpointTable",
  () => ({
    __esModule: true,
    default: () => <div>ImageDedicatedEndpointTable</div>,
  }),
);
jest.mock(
  "@/app/billing/billing-details/components/LLMDedicatedEndpointTable",
  () => ({
    __esModule: true,
    default: () => <div>LLMDedicatedEndpointTable</div>,
  }),
);
jest.mock("@/app/billing/billing-details/components/Sandbox", () => ({
  __esModule: true,
  default: () => <div>SandboxTable</div>,
}));
jest.mock("@/app/billing/billing-details/components/APIKeyTable", () => ({
  __esModule: true,
  default: () => <div>APIKeyTable</div>,
}));

describe("DetailContent", () => {
  beforeEach(() => {
    mockCurrentTeam = "team-1";
  });

  it("defaults to the OnDemand view rendering the usage-based tables", () => {
    render(<DetailContent />);

    expect(screen.getByText("SummaryTable")).toBeInTheDocument();
    expect(screen.getByText("LLMTable")).toBeInTheDocument();
    expect(screen.getByText("GenAPITable")).toBeInTheDocument();
    expect(screen.getByText("SandboxTable")).toBeInTheDocument();
    // OnDemand tooltip
    expect(
      screen.getByText(
        "Billing records are generated at an hourly interval. As an exception, storage services are billed daily, with records generated at 00:00 UTC.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/minimum charge of \$0\.0001/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Image/Video/Search" }),
    ).toBeInTheDocument();
  });

  it("switches to Monthly tables and tooltip", () => {
    render(<DetailContent />);

    fireEvent.click(screen.getByRole("button", { name: "cat Monthly" }));

    expect(screen.getByText("SummaryTableMonthly")).toBeInTheDocument();
    expect(screen.getByText("ImageDedicatedEndpointTable")).toBeInTheDocument();
    expect(
      screen.getByText(
        /billing statements are\s+generated on a monthly cycle/i,
      ),
    ).toBeInTheDocument();
  });

  it("switches to MultiDimension showing creator tab when a team is set", () => {
    render(<DetailContent />);

    fireEvent.click(screen.getByRole("button", { name: "cat MultiDimension" }));

    expect(screen.getByText("PurcherTable")).toBeInTheDocument();
    expect(screen.getByText("APIKeyTable")).toBeInTheDocument();
    expect(screen.getByText("By Creator")).toBeInTheDocument();
  });

  it("hides the By Creator tab when there is no current team", () => {
    mockCurrentTeam = null;
    render(<DetailContent />);

    fireEvent.click(screen.getByRole("button", { name: "cat MultiDimension" }));

    expect(screen.queryByText("By Creator")).not.toBeInTheDocument();
    expect(screen.getByText("By API Key")).toBeInTheDocument();
  });

  it("switches to the Enterprise table view", () => {
    render(<DetailContent />);

    fireEvent.click(screen.getByRole("button", { name: "cat Enterprise" }));

    expect(screen.getByText("EnterpriseTable")).toBeInTheDocument();
  });
});
