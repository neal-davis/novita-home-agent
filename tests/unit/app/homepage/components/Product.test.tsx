import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import Product from "@/app/homepage/components/Product";
import { NOVITA_URL } from "@/constants/urls";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt = "", src }: { alt?: string; src?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

jest.mock("@/app/components/button/Button", () => ({
  __esModule: true,
  default: ({
    children,
    link,
    renderTag,
    ...props
  }: {
    children: React.ReactNode;
    link?: string;
    renderTag?: "link";
  }) =>
    renderTag === "link" ? (
      <a href={link} {...props}>
        {children}
      </a>
    ) : (
      <button type="button" {...props}>
        {children}
      </button>
    ),
}));

jest.mock("@/app/sandbox1/components/SectionEyebrow", () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <p>{label}</p>,
}));

jest.mock("@/app/homepage/components/ProductAgentSandboxSection", () => ({
  __esModule: true,
  default: ({ sectionRef }: { sectionRef: React.Ref<HTMLDivElement> }) => (
    <section ref={sectionRef} data-section-id="agent-sandbox">
      Agent Sandbox panel
    </section>
  ),
}));

jest.mock("@/app/homepage/components/ProductGpuCloudSection", () => ({
  __esModule: true,
  default: ({ sectionRef }: { sectionRef: React.Ref<HTMLDivElement> }) => (
    <section ref={sectionRef} data-section-id="gpu-cloud">
      GPU Cloud panel
    </section>
  ),
}));

jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: ({ modelName }: { modelName: string }) => (
    <span data-testid="model-logo">{modelName}</span>
  ),
}));

jest.mock("@/config/homepageModelApiCards", () => ({
  HOME_MODEL_API_CARDS: [
    {
      context_size: 8192,
      displayName: "Llama Scout",
      id: "meta/llama-scout",
      input_token_price_per_m_toString: "0.10",
      name: "llama-scout",
      output_token_price_per_m_toString: "0.20",
      tags: ["LLM"],
    },
    {
      context_size: 4096,
      displayName: "",
      id: "black-forest-labs/flux-schnell",
      input_token_price_per_m_toString: "0.01",
      name: "Flux Schnell",
      output_token_price_per_m_toString: "0.03",
      tags: ["IMAGE"],
    },
  ],
}));

jest.mock("@/hooks/useElementActivity", () => ({
  useElementActivity: jest.fn(() => ({
    isActive: true,
    ref: jest.fn(),
  })),
  usePageVisible: jest.fn(() => true),
}));

jest.mock("@/hooks/useHeaderHeight", () => ({
  ORI_HEADER_HEIGHT: 64,
  useHeaderHeight: jest.fn(() => ({ noticeHeight: 12 })),
}));

jest.mock("@/i18n/provider", () => ({
  useI18nSubscription: jest.fn(),
}));

jest.mock("@/lib/icons/VizAssets", () => ({
  VizBracket: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="viz-bracket" {...props} />
  ),
  VizConnector1: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="viz-connector-1" {...props} />
  ),
  VizConnector2: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="viz-connector-2" {...props} />
  ),
  VizConnector3: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="viz-connector-3" {...props} />
  ),
  VizConnector4: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="viz-connector-4" {...props} />
  ),
  VizConnector5: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="viz-connector-5" {...props} />
  ),
  VizIconLlm: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span data-testid="viz-icon-llm" {...props} />
  ),
}));

jest.mock("@/app/homepage/components/model-viz/GreenNameTag", () => ({
  GreenNameSlot: ({ name }: { name: string; slotWidth: number }) => (
    <span data-testid="green-name-slot">{name}</span>
  ),
  GreenNameTag: ({ name }: { name: string }) => (
    <span data-testid="green-name-tag">{name}</span>
  ),
}));

describe("Product homepage section", () => {
  let scrollToSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    scrollToSpy = jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.matchMedia = jest.fn((query: string) => ({
      addEventListener: jest.fn(),
      addListener: jest.fn(),
      dispatchEvent: jest.fn(),
      matches: query.includes("1024"),
      media: query,
      onchange: null,
      removeEventListener: jest.fn(),
      removeListener: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    jest
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 1;
      });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders the product navigation, main CTAs, and model cards", () => {
    render(<Product />);

    expect(
      screen.getByRole("complementary", { name: "Product navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("MODEL APIS")).toBeInTheDocument();
    expect(screen.getByText("Agent Sandbox panel")).toBeInTheDocument();
    expect(screen.getByText("GPU Cloud panel")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Explore All Models/i }),
    ).toHaveAttribute("href", NOVITA_URL.MODEL_LIBRARY_INDEX);
    expect(screen.getByRole("link", { name: /Get Started/i })).toHaveAttribute(
      "href",
      NOVITA_URL.DEDICATED_ENDPOINT,
    );
    expect(screen.getAllByText("Llama Scout").length).toBeGreaterThan(1);
    expect(screen.getAllByText("Flux Schnell").length).toBeGreaterThan(1);
    expect(
      screen.getAllByRole("link", { name: /Llama Scout/i })[0],
    ).toHaveAttribute("href", "/models/model-detail/meta-llama-scout");
  });

  it("scrolls to sidebar sections with the configured sticky offset", () => {
    render(<Product />);

    fireEvent.click(screen.getByRole("button", { name: "Agent Sandbox" }));

    expect(scrollToSpy).toHaveBeenCalledWith({
      behavior: "smooth",
      top: 0,
    });
  });

  it("auto-cycles the visible inference model label while the page is visible", () => {
    render(<Product />);

    expect(screen.getByTestId("green-name-slot")).toHaveTextContent(
      '"KIMI-K2.5"',
    );

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(screen.getByTestId("green-name-slot")).toHaveTextContent(
      '"FLUX/1/SCHNELL"',
    );
    expect(screen.getByTestId("viz-connector-2")).toBeInTheDocument();
  });
});
