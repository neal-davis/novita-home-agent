import { render, screen } from "@testing-library/react";
import Page from "@/app/gpus-console/image/page";

jest.mock("@/app/gpus-console/image/components/section", () => ({
  __esModule: true,
  default: () => <main>image section</main>,
}));

describe("image Page", () => {
  it("renders the image section", () => {
    render(<Page />);
    expect(screen.getByText("image section")).toBeInTheDocument();
  });
});
