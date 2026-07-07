import { render, screen } from "@testing-library/react";
import { TryModel } from "@/app/models-console/llm-playground/components/try-model/tryModel";

let mockModel: any;
jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({ useModel: () => ({ currentModel: mockModel }) }),
);

jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: ({ modelName }: any) => (
    <div data-testid="model-logo">{modelName}</div>
  ),
}));

describe("TryModel (more branches)", () => {
  it("falls back to name then id for the logo when displayName is absent", () => {
    mockModel = { name: "llama-name", id: "meta/llama" };
    render(<TryModel />);
    expect(screen.getByTestId("model-logo")).toHaveTextContent("llama-name");
  });

  it("falls back to id when displayName and name are absent", () => {
    mockModel = { id: "meta/llama" };
    const { getByTestId } = render(<TryModel />);
    expect(getByTestId("model-logo")).toHaveTextContent("meta/llama");
  });

  it("renders empty strings when there is no current model", () => {
    mockModel = null;
    render(<TryModel />);
    // helper copy still renders even with an empty model name (spaces collapse)
    expect(
      screen.getByText(/Kick the tires, see how\s+performs on Novita AI/),
    ).toBeInTheDocument();
  });
});
