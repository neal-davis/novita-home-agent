import { render, screen, fireEvent } from "@testing-library/react";
import { CreateEndpointHeader } from "@/app/models-console/llm-dedicated-endpoints/sub-pages/CreateEndpoint/CreateEndpointHeader";

describe("CreateEndpointHeader", () => {
  it("renders title, description and model library link", () => {
    render(<CreateEndpointHeader onBack={jest.fn()} />);
    expect(screen.getByText("Create Dedicated Endpoint")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Model Library" }),
    ).toBeInTheDocument();
  });

  it("back button fires onBack", () => {
    const onBack = jest.fn();
    render(<CreateEndpointHeader onBack={onBack} />);
    fireEvent.click(screen.getByRole("button", { name: /Back to Endpoints/ }));
    expect(onBack).toHaveBeenCalled();
  });
});
