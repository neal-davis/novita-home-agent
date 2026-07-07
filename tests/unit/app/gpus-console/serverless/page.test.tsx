import { render, screen } from "@testing-library/react";
import Page from "@/app/gpus-console/serverless/page";

jest.mock("@/app/gpus-console/serverless/components/container", () => ({
  __esModule: true,
  default: () => <main>serverless container</main>,
}));

describe("serverless Page", () => {
  it("renders the serverless container", () => {
    render(<Page />);
    expect(screen.getByText("serverless container")).toBeInTheDocument();
  });
});
