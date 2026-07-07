import { act, fireEvent, render, screen } from "@testing-library/react";
import { TopNavigationItems } from "@/app/components/header/partials/TopNavigationItems";

let mockPathname = "/pricing";
let mockFrom: string | null = null;

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => ({ get: () => mockFrom }),
}));

jest.mock("@/i18n/config", () => ({
  getLocalizedPath: (p: string) => p,
  getPathnameWithoutLocale: (p: string) => p,
}));
jest.mock("@/i18n/provider", () => ({ useI18n: () => ({ locale: "en" }) }));
jest.mock("@/lib/utils", () => ({
  cn: (...a: any[]) =>
    a
      .flatMap((x) =>
        typeof x === "object" && x !== null
          ? Object.entries(x)
              .filter(([, v]) => v)
              .map(([k]) => k)
          : x,
      )
      .filter(Boolean)
      .join(" "),
}));

const items: any[] = [
  { key: "pricing", title: "Pricing", path: "/pricing", elmId: "nav-pricing" },
  {
    key: "gpus",
    title: "GPUs",
    elmId: "nav-gpus",
    dropdown: [
      {
        key: "gpu-instance",
        title: "GPU Instance",
        path: "/gpu-instance",
        elmId: "sub-gi",
      },
    ],
  },
  {
    key: "products",
    title: "Products",
    elmId: "nav-products",
    dropdown: [
      {
        key: "models",
        title: "Model APIs",
        path: "/models-console",
        elmId: "sub-m",
      },
    ],
  },
  {
    key: "sandbox",
    id: "sandbox",
    title: "Sandbox",
    path: "/sandbox",
    elmId: "nav-sandbox",
  },
  { key: "console", title: "Console", path: "/console", elmId: "nav-console" },
];

describe("TopNavigationItems more branches", () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockPathname = "/pricing";
    mockFrom = null;
  });

  it("renders the sandbox new-badge image", () => {
    render(<TopNavigationItems items={items} />);
    expect(screen.getByAltText("new")).toBeInTheDocument();
    expect(screen.getByText("Sandbox")).toBeInTheDocument();
  });

  it("applies underline styling to the console link", () => {
    render(<TopNavigationItems items={items} />);
    expect(screen.getByText("Console").closest("a")?.className).toContain(
      "underline",
    );
  });

  it("toggles a click dropdown open then closed", () => {
    render(<TopNavigationItems items={items} />);
    fireEvent.click(screen.getByText("Products"));
    expect(screen.getByText("Model APIs")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Products"));
    expect(screen.queryByText("Model APIs")).not.toBeInTheDocument();
  });

  it("closes a click dropdown when clicking outside the document", () => {
    render(<TopNavigationItems items={items} />);
    fireEvent.click(screen.getByText("Products"));
    expect(screen.getByText("Model APIs")).toBeInTheDocument();
    act(() => {
      document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(screen.queryByText("Model APIs")).not.toBeInTheDocument();
  });

  it("closes the GPUs hover dropdown after mouse leave timeout", () => {
    jest.useFakeTimers();
    render(<TopNavigationItems items={items} />);
    const gpusWrap = screen.getByText("GPUs").closest("div")!;
    fireEvent.mouseEnter(gpusWrap);
    expect(screen.getByText("GPU Instance")).toBeInTheDocument();
    fireEvent.mouseLeave(gpusWrap);
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.queryByText("GPU Instance")).not.toBeInTheDocument();
  });

  it("keeps the GPUs dropdown open when re-entering before timeout", () => {
    jest.useFakeTimers();
    render(<TopNavigationItems items={items} />);
    const gpusWrap = screen.getByText("GPUs").closest("div")!;
    fireEvent.mouseEnter(gpusWrap);
    fireEvent.mouseLeave(gpusWrap);
    fireEvent.mouseEnter(gpusWrap); // cancels the close timeout
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByText("GPU Instance")).toBeInTheDocument();
  });

  it("highlights only Pricing on a model-detail page from=pricing", () => {
    mockPathname = "/models/model-detail/foo";
    mockFrom = "pricing";
    render(<TopNavigationItems items={items} />);
    expect(screen.getByText("Pricing").closest("a")?.className).toContain(
      "active",
    );
  });

  it("highlights the Products dropdown when a sub item matches /llm", () => {
    mockPathname = "/llm/gpt";
    render(<TopNavigationItems items={items} />);
    // the Products button (models-console sub) should be active via the
    // playground/llm special-case
    expect(screen.getByText("Products").className).toContain("active");
  });
});
