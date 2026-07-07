import { render, screen } from "@testing-library/react";
import LLMPlaygroundPage from "@/app/models-console/llm-playground/page";

jest.mock("@/app/models-console/llm-playground/playgroundClient", () => ({
  __esModule: true,
  default: () => <div data-testid="playground-client" />,
}));

describe("LLM playground page", () => {
  it("renders the PlaygroundClient", () => {
    render(<LLMPlaygroundPage />);
    expect(screen.getByTestId("playground-client")).toBeInTheDocument();
  });
});
