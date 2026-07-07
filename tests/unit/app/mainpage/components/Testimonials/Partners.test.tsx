import { act, fireEvent, render, screen } from "@testing-library/react";
import Partners from "@/app/mainpage/components/Testimonials/Partners";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src, style }: { alt: string; src: string; style?: any }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} style={style} />
  ),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    id,
  }: {
    children: React.ReactNode;
    href: string;
    id?: string;
  }) => (
    <a href={href} id={id}>
      {children}
    </a>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

describe("Testimonials Partners", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(window, "screen", {
      configurable: true,
      value: { width: 1280 },
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("renders cloned desktop cards, mobile cards, and case study link", () => {
    render(<Partners />);

    expect(
      screen.getAllByText(/Novita has been instrumental/i).length,
    ).toBeGreaterThan(1);
    expect(screen.getAllByText("Go to Case Study").length).toBeGreaterThan(1);
    expect(
      screen.getAllByRole("link", { name: "Go to Case Study" })[0],
    ).toHaveAttribute("href", "https://blogs.novita.ai/case-study-bebee");
    expect(screen.getAllByAltText("logo").length).toBeGreaterThanOrEqual(12);
  });

  it("initializes scroll position and handles prev/next/wheel updates", () => {
    const { container } = render(<Partners />);
    const scroller = container.querySelector(
      "[class*='swiper_container']",
    ) as HTMLDivElement;
    const prev = container.querySelector(".swiper-button-prev") as HTMLElement;
    const next = container.querySelector(".swiper-button-next") as HTMLElement;

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(scroller.scrollLeft).toBe(2144);

    fireEvent.click(next);
    expect(scroller.scrollLeft).toBe(2680);

    fireEvent.click(prev);
    expect(scroller.scrollLeft).toBe(2144);

    fireEvent.wheel(scroller, { deltaX: 12, deltaY: 0 });
    expect(scroller.style.transition).toBe("none");
  });

  it("jumps from cloned regions back into the real carousel window", () => {
    const { container } = render(<Partners />);
    const scroller = container.querySelector(
      "[class*='swiper_container']",
    ) as HTMLDivElement;

    act(() => {
      jest.advanceTimersByTime(100);
    });

    scroller.scrollLeft = 4300;
    fireEvent.scroll(scroller);
    expect(scroller.scrollLeft).toBe(2144);

    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(scroller.style.scrollBehavior).toBe("smooth");

    scroller.scrollLeft = 1500;
    fireEvent.scroll(scroller);
    expect(scroller.scrollLeft).toBe(3752);
  });
});
