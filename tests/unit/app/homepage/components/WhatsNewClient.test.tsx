import { act, fireEvent, render, screen } from "@testing-library/react";
import WhatsNewClient from "@/app/homepage/components/WhatsNewClient";

jest.mock("@/app/sandbox1/components/SectionEyebrow", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <h2>{label}</h2>,
}));

jest.mock("@/i18n/provider", () => ({
  useI18nSubscription: jest.fn(),
}));

const cards = [
  {
    title: ["Announcement"],
    description: ["New LLM model is available"],
    subTitle: "MTokens I 204800",
    tags: ["LLM"],
    logo: "/logo-a.svg",
    link: "https://example.com/a",
    type: "announcement",
  },
  {
    title: "CASE STUDY",
    description: "Partner deployment story",
    coBrandInfo: [
      { brandName: "Acme", brandLogo: "/acme.svg" },
      { brandName: "Novita" },
      {},
    ],
    tags: ["case study"],
    type: "case-study",
  },
  {
    title: "Research note",
    description: "A new research update",
    hightlightStr: "Latency I 50",
    coBrandLogo: "/research.svg",
    type: "research",
  },
  {
    title: "Fourth",
    description: "Fourth description",
    link: "https://example.com/d",
  },
];

function installBrowserMocks(matches = true) {
  const listeners = new Set<() => void>();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches,
      media: "(min-width: 1024px)",
      addEventListener: (_event: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_event: string, cb: () => void) =>
        listeners.delete(cb),
    })),
  });

  class MockResizeObserver {
    observe(element: Element) {
      Object.defineProperty(element, "getBoundingClientRect", {
        configurable: true,
        value: () => ({ width: 1000, height: 300 }),
      });
    }
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: MockResizeObserver,
  });
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: jest.fn(),
  });
}

describe("WhatsNewClient", () => {
  beforeEach(() => {
    installBrowserMocks(true);
  });

  it("normalizes card content, labels, brand rows, and empty links", () => {
    render(<WhatsNewClient cards={cards} />);

    expect(
      screen.getByRole("heading", { name: "What's New" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("ANNOUNCEMENT").length).toBeGreaterThan(0);
    expect(screen.getByText("New LLM model is available")).toBeInTheDocument();
    expect(screen.getByText("MTokens | 204800")).toBeInTheDocument();
    expect(screen.getByText("LLM")).toBeInTheDocument();

    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("Novita")).toBeInTheDocument();
    expect(screen.getByText("Partner deployment story")).toBeInTheDocument();
    expect(screen.getByText("RESEARCH")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /New LLM model is available/i }),
    ).toHaveAttribute("href", "https://example.com/a");
  });

  it("updates carousel index from next, previous, and scroll events", () => {
    const { container } = render(<WhatsNewClient cards={cards} />);
    const track = container.querySelector(
      "[class*='overflow-x-auto']",
    ) as HTMLElement;
    const scrollTo = jest.spyOn(track, "scrollTo");

    const previous = screen.getByRole("button", { name: "Previous" });
    const next = screen.getByRole("button", { name: "Next" });
    expect(previous).toBeDisabled();
    expect(next).not.toBeDisabled();

    fireEvent.click(next);
    expect(scrollTo).toHaveBeenCalledWith({ left: 346, behavior: "smooth" });
    expect(previous).not.toBeDisabled();
    expect(next).toBeDisabled();

    fireEvent.click(previous);
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });

    act(() => {
      Object.defineProperty(track, "scrollLeft", {
        configurable: true,
        value: 346,
      });
      fireEvent.scroll(track);
    });
    expect(previous).not.toBeDisabled();
  });

  it("renders nothing when no cards are provided", () => {
    const { container } = render(<WhatsNewClient cards={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
