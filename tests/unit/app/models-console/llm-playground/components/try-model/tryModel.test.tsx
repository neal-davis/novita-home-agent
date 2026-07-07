import { render, screen } from "@testing-library/react";
import { TryModel } from "@/app/models-console/llm-playground/components/try-model/tryModel";

jest.mock(
  "@/app/models-console/llm-playground/providers/ModelProvider",
  () => ({
    useModel: () => ({
      currentModel: {
        displayName: "GPT-4.1",
      },
    }),
  }),
);

jest.mock("@/app/components/ModelLibrary/ModelLogo", () => ({
  __esModule: true,
  default: function MockModelLogo() {
    return <div data-testid="model-logo" />;
  },
}));

describe("TryModel", () => {
  it("renders the model name with spaces around it in the helper copy", () => {
    render(<TryModel />);

    expect(
      screen.getByText("Kick the tires, see how GPT-4.1 performs on Novita AI"),
    ).toBeInTheDocument();
  });
});
