import { fireEvent, render, screen } from "@testing-library/react";

const scrollPrev = jest.fn();
const scrollNext = jest.fn();
const on = jest.fn();
const off = jest.fn();
let canPrev = true;
let canNext = true;

const fakeApi = {
  scrollPrev,
  scrollNext,
  canScrollPrev: () => canPrev,
  canScrollNext: () => canNext,
  on,
  off,
};

jest.mock("embla-carousel-react", () => ({
  __esModule: true,
  default: () => [jest.fn(), fakeApi],
}));

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

beforeEach(() => {
  jest.clearAllMocks();
  canPrev = true;
  canNext = true;
});

describe("Carousel", () => {
  it("renders slides and wires prev/next buttons to the embla api", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );

    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
    expect(screen.getByRole("region")).toBeInTheDocument();
    // both slides expose the slide roledescription
    expect(screen.getAllByRole("group")).toHaveLength(2);

    fireEvent.click(screen.getByText("Previous slide"));
    expect(scrollPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Next slide"));
    expect(scrollNext).toHaveBeenCalled();

    // subscribes to embla events
    expect(on).toHaveBeenCalledWith("select", expect.any(Function));
    expect(on).toHaveBeenCalledWith("reInit", expect.any(Function));
  });

  it("disables nav buttons when the api cannot scroll", () => {
    canPrev = false;
    canNext = false;

    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Only slide</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );

    expect(screen.getByText("Previous slide").closest("button")).toBeDisabled();
    expect(screen.getByText("Next slide").closest("button")).toBeDisabled();
  });

  it("handles arrow-key navigation", () => {
    render(
      <Carousel data-testid="region">
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    const region = screen.getByTestId("region");
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(scrollPrev).toHaveBeenCalled();

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(scrollNext).toHaveBeenCalled();
  });

  it("reports the api through setApi and supports vertical orientation", () => {
    const setApi = jest.fn();

    render(
      <Carousel orientation="vertical" setApi={setApi}>
        <CarouselContent className="vlist">
          <CarouselItem>V Slide</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    expect(setApi).toHaveBeenCalledWith(fakeApi);
    expect(screen.getByText("V Slide")).toBeInTheDocument();
  });
});
