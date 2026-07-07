import { render } from "@testing-library/react";
import { Toaster } from "@/components/ui/sonner";

let captured: any = {};
jest.mock("sonner", () => ({
  Toaster: (props: any) => {
    captured = props;
    return <div data-testid="sonner" />;
  },
}));

beforeEach(() => {
  captured = {};
});

describe("Toaster (sonner wrapper)", () => {
  it("renders with top-center position and configured icons", () => {
    const { getByTestId } = render(<Toaster />);
    expect(getByTestId("sonner")).toBeInTheDocument();
    expect(captured.position).toBe("top-center");
    expect(captured.icons).toHaveProperty("success");
    expect(captured.icons).toHaveProperty("error");
  });

  it("forwards extra props to the underlying Toaster", () => {
    render(<Toaster theme="dark" />);
    expect(captured.theme).toBe("dark");
  });
});
