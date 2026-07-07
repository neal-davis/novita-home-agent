import { render, screen } from "@testing-library/react";
import Page from "@/app/gpus-console/storage/page";

jest.mock("@/app/gpus-console/storage/components/section", () => ({
  __esModule: true,
  default: () => <main>storage section</main>,
}));

describe("storage Page", () => {
  it("renders the storage section", async () => {
    render(await Page());
    expect(screen.getByText("storage section")).toBeInTheDocument();
  });
});
