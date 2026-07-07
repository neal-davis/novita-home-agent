import { render, screen } from "@testing-library/react";
import { ConsoleNotice } from "@/app/billing/components/notice/consoleNotice";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("ConsoleNotice", () => {
  it("renders the title when provided", () => {
    render(<ConsoleNotice title="Heads up" description="something happened" />);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("something happened")).toBeInTheDocument();
    expect(screen.getByAltText("notice")).toBeInTheDocument();
  });

  it("omits the title when not provided", () => {
    render(<ConsoleNotice description="only description" />);
    expect(screen.getByText("only description")).toBeInTheDocument();
    expect(screen.queryByText("Heads up")).not.toBeInTheDocument();
  });

  it("uses a custom icon when supplied", () => {
    render(
      <ConsoleNotice
        description="custom"
        icon={<span data-testid="custom-icon" />}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.queryByAltText("notice")).not.toBeInTheDocument();
  });
});
