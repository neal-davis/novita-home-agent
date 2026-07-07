import { render, screen } from "@testing-library/react";
import Layout, { metadata } from "@/app/sandbox-console/layout";

jest.mock("@/app/components/header/ConsoleHeaderWrapper", () => ({
  __esModule: true,
  default: ({
    children,
    product,
  }: {
    children: React.ReactNode;
    product: string;
  }) => (
    <div data-testid="header-wrapper" data-product={product}>
      {children}
    </div>
  ),
}));

describe("sandbox-console layout", () => {
  it("exposes the console page metadata title", () => {
    expect(metadata.title).toBe("Novita AI console");
  });

  it("wraps children in the sandbox console header wrapper", async () => {
    // Layout is an async server component; resolve it to its element first.
    const element = await Layout({
      children: <div>child content</div>,
    });
    render(element);

    const wrapper = screen.getByTestId("header-wrapper");
    expect(wrapper).toHaveAttribute("data-product", "sandbox");
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
