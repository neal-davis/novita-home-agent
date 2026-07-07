import { fireEvent, render, screen } from "@testing-library/react";

const scrollPrev = jest.fn();
const scrollNext = jest.fn();
const fakeApi = {
  scrollPrev,
  scrollNext,
  canScrollPrev: () => true,
  canScrollNext: () => true,
  on: jest.fn(),
  off: jest.fn(),
  scrollSnapList: () => [0, 1, 2],
  selectedScrollSnap: () => 0,
};

jest.mock("embla-carousel-react", () => ({
  __esModule: true,
  default: () => [jest.fn(), fakeApi],
}));

import {
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
} from "@/components/ai-elements/inline-citation";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

beforeEach(() => jest.clearAllMocks());

describe("InlineCitation carousel", () => {
  it("renders carousel items and a computed index from the api", () => {
    render(
      <InlineCitationCarousel>
        <InlineCitationCarouselHeader>
          <InlineCitationCarouselIndex />
        </InlineCitationCarouselHeader>
        <InlineCitationCarouselContent>
          <InlineCitationCarouselItem>Source A</InlineCitationCarouselItem>
          <InlineCitationCarouselItem>Source B</InlineCitationCarouselItem>
        </InlineCitationCarouselContent>
      </InlineCitationCarousel>,
    );

    expect(screen.getByText("Source A")).toBeInTheDocument();
    expect(screen.getByText("Source B")).toBeInTheDocument();
    // current(1)/count(3) derived from the mocked api snaps
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("renders custom index children when provided", () => {
    render(
      <InlineCitationCarousel>
        <InlineCitationCarouselIndex>page two</InlineCitationCarouselIndex>
      </InlineCitationCarousel>,
    );
    expect(screen.getByText("page two")).toBeInTheDocument();
  });

  it("prev/next buttons drive the carousel api", () => {
    render(
      <InlineCitationCarousel>
        <InlineCitationCarouselPrev />
        <InlineCitationCarouselNext />
        <InlineCitationCarouselContent>
          <InlineCitationCarouselItem>X</InlineCitationCarouselItem>
        </InlineCitationCarouselContent>
      </InlineCitationCarousel>,
    );

    fireEvent.click(screen.getByLabelText("Previous"));
    expect(scrollPrev).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Next"));
    expect(scrollNext).toHaveBeenCalled();
  });

  it("renders the hover-card body content", () => {
    render(
      <InlineCitationCard open>
        <InlineCitationCardBody>body content</InlineCitationCardBody>
      </InlineCitationCard>,
    );
    expect(screen.getByText("body content")).toBeInTheDocument();
  });
});
