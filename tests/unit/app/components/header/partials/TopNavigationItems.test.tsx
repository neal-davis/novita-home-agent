import { fireEvent, render, screen } from "@testing-library/react";
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
      {
        key: "gpu-baremetal",
        title: "Bare Metal",
        path: "/gpu-baremetal",
        elmId: "sub-bm",
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
];

describe("TopNavigationItems", () => {
  beforeEach(() => {
    mockPathname = "/pricing";
    mockFrom = null;
  });

  it("renders plain link items and dropdown trigger buttons", () => {
    render(<TopNavigationItems items={items} />);
    expect(screen.getByText("Pricing").closest("a")).toHaveAttribute(
      "href",
      "/pricing",
    );
    expect(screen.getByText("GPUs")).toBeInTheDocument();
  });

  it("marks the active link based on the current path", () => {
    mockPathname = "/pricing";
    render(<TopNavigationItems items={items} />);
    expect(screen.getByText("Pricing").closest("a")?.className).toContain(
      "active",
    );
  });

  it("opens a click dropdown and shows its sub-items", () => {
    render(<TopNavigationItems items={items} />);
    fireEvent.click(screen.getByText("Products"));
    expect(screen.getByText("Model APIs")).toBeInTheDocument();
  });

  it("opens the GPUs hover dropdown on mouse enter", () => {
    render(<TopNavigationItems items={items} />);
    const gpusButton = screen.getByText("GPUs").closest("div")!;
    fireEvent.mouseEnter(gpusButton);
    expect(screen.getByText("GPU Instance")).toBeInTheDocument();
  });

  it("does not highlight nav items on a model-detail page coming from home", () => {
    mockPathname = "/models/model-detail/some-model";
    mockFrom = "home";
    render(<TopNavigationItems items={items} />);
    expect(screen.getByText("Pricing").closest("a")?.className).not.toContain(
      "active",
    );
  });
});
