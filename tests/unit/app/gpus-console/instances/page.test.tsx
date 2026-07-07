import { render, screen } from "@testing-library/react";
import Page from "@/app/gpus-console/instances/page";

jest.mock("@/app/gpus-console/instances/components/container", () => ({
  __esModule: true,
  default: () => <main>instances container</main>,
}));

describe("instances Page", () => {
  it("renders the instances container", async () => {
    render(await Page());
    expect(screen.getByText("instances container")).toBeInTheDocument();
  });
});
