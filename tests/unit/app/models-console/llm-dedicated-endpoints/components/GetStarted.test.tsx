import { render, screen, fireEvent } from "@testing-library/react";
import GetStarted from "@/app/models-console/llm-dedicated-endpoints/components/GetStarted";

describe("GetStarted", () => {
  it("renders empty-state title, description and HF link", () => {
    render(<GetStarted goToCreateEndpoint={jest.fn()} />);
    expect(screen.getByText("Dedicated Endpoints")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hugging Face" })).toHaveAttribute(
      "href",
      "https://huggingface.co",
    );
    expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute(
      "href",
      "https://novita.ai/docs/guides/llm-dedicated-endpoint",
    );
  });

  it("Create Endpoint button fires callback", () => {
    const goToCreateEndpoint = jest.fn();
    render(<GetStarted goToCreateEndpoint={goToCreateEndpoint} />);
    fireEvent.click(screen.getByRole("button", { name: "Create Endpoint" }));
    expect(goToCreateEndpoint).toHaveBeenCalled();
  });
});
