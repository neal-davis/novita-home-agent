import { render, screen } from "@testing-library/react";
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationQuote,
  InlineCitationSource,
  InlineCitationText,
} from "@/components/ai-elements/inline-citation";

beforeAll(() => {
  Object.defineProperty(document, "elementsFromPoint", {
    configurable: true,
    value: jest.fn(() => []),
  });
});

describe("InlineCitation pieces", () => {
  it("renders inline citation text", () => {
    render(
      <InlineCitation>
        <InlineCitationText>cited fact</InlineCitationText>
      </InlineCitation>,
    );
    expect(screen.getByText("cited fact")).toBeInTheDocument();
  });

  it("trigger shows the hostname of the first source", () => {
    render(
      <InlineCitationCard>
        <InlineCitationCardTrigger sources={["https://example.com/a"]} />
      </InlineCitationCard>,
    );
    expect(screen.getByText(/example\.com/)).toBeInTheDocument();
  });

  it("trigger shows a +N suffix for multiple sources", () => {
    render(
      <InlineCitationCard>
        <InlineCitationCardTrigger
          sources={["https://example.com/a", "https://other.com/b"]}
        />
      </InlineCitationCard>,
    );
    expect(screen.getByText(/\+1/)).toBeInTheDocument();
  });

  it("trigger shows 'unknown' when there are no sources", () => {
    render(
      <InlineCitationCard>
        <InlineCitationCardTrigger sources={[]} />
      </InlineCitationCard>,
    );
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("InlineCitationSource renders title, url and description", () => {
    render(
      <InlineCitationSource
        title="My Title"
        url="https://x.com"
        description="A short summary"
      />,
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
    expect(screen.getByText("https://x.com")).toBeInTheDocument();
    expect(screen.getByText("A short summary")).toBeInTheDocument();
  });

  it("InlineCitationSource omits missing fields", () => {
    const { container } = render(<InlineCitationSource title="Only title" />);
    expect(screen.getByText("Only title")).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("InlineCitationQuote renders a blockquote", () => {
    render(<InlineCitationQuote>quoted text</InlineCitationQuote>);
    const quote = screen.getByText("quoted text");
    expect(quote.tagName.toLowerCase()).toBe("blockquote");
  });
});
