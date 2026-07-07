import { render, screen } from "@testing-library/react";
import EndpointModelInfo from "@/app/models-console/llm-dedicated-endpoints/components/EndpointModelInfo";

describe("EndpointModelInfo", () => {
  it("renders model id with huggingface link", () => {
    render(<EndpointModelInfo baseModel={{ modelId: "meta/m" } as never} />);
    expect(screen.getByText("Model")).toBeInTheDocument();
    expect(screen.getByText("meta/m")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://huggingface.co/meta/m");
  });

  it("shows revision when present", () => {
    render(
      <EndpointModelInfo
        baseModel={{ modelId: "meta/m", revision: "v2" } as never}
      />,
    );
    expect(screen.getByText("v2")).toBeInTheDocument();
  });

  it("omits revision when absent", () => {
    render(<EndpointModelInfo baseModel={{ modelId: "meta/m" } as never} />);
    expect(screen.queryByText("v2")).not.toBeInTheDocument();
  });
});
