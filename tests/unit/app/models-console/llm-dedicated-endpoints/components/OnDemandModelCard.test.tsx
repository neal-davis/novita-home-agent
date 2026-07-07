import { render, screen, fireEvent } from "@testing-library/react";
import OnDemandModelCard from "@/app/models-console/llm-dedicated-endpoints/components/OnDemandModelCard";

jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: ({ modelName }: { modelName: string }) => (
    <div>logo:{modelName}</div>
  ),
}));

describe("OnDemandModelCard", () => {
  it("renders displayModelName when provided", () => {
    render(<OnDemandModelCard modelName="meta/m" displayModelName="Meta M" />);
    expect(screen.getByText("Meta M")).toBeInTheDocument();
    expect(screen.getByText("Serverless")).toBeInTheDocument();
    expect(screen.getByText("Dedicated")).toBeInTheDocument();
  });

  it("falls back to modelName when no display name", () => {
    render(<OnDemandModelCard modelName="meta/m" />);
    expect(screen.getByText("meta/m")).toBeInTheDocument();
  });

  it("fires onClick", () => {
    const onClick = jest.fn();
    render(<OnDemandModelCard modelName="meta/m" onClick={onClick} />);
    fireEvent.click(screen.getByText("meta/m"));
    expect(onClick).toHaveBeenCalled();
  });
});
