import { render, screen } from "@testing-library/react";
import { Response } from "@/components/ai-elements/response";

// streamdown is loaded via next/dynamic; mock the underlying module so the
// dynamic import resolves to a simple renderer.
jest.mock("streamdown", () => ({
  __esModule: true,
  Streamdown: ({ children, className }: any) => (
    <div data-testid="streamdown" className={className}>
      {children}
    </div>
  ),
}));

describe("Response", () => {
  it("renders streamed markdown children", async () => {
    render(<Response>Hello markdown</Response>);
    expect(await screen.findByTestId("streamdown")).toHaveTextContent(
      "Hello markdown",
    );
  });

  it("merges a custom className onto the streamdown wrapper", async () => {
    render(<Response className="resp-x">x</Response>);
    expect(await screen.findByTestId("streamdown")).toHaveClass("resp-x");
  });
});
