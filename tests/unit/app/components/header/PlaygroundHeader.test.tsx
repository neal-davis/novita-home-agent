import { render, screen } from "@testing-library/react";
import PlaygroundHeader from "@/app/components/header/PlaygroundHeader";

const mockState: any = { user: { uuid: "u1" } };

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

jest.mock("@/app/components/header/Header", () => ({
  __esModule: true,
  default: (props: any) => (
    <div
      data-testid="header"
      data-page={props.page}
      data-position={props.position}
      data-size={props.size}
      data-nomobile={String(props.noMobile)}
    />
  ),
}));

describe("PlaygroundHeader", () => {
  it("renders the shared Header configured for the playground page", () => {
    render(<PlaygroundHeader />);
    const header = screen.getByTestId("header");
    expect(header).toHaveAttribute("data-page", "playground");
    expect(header).toHaveAttribute("data-position", "relative");
    expect(header).toHaveAttribute("data-size", "full");
    expect(header).toHaveAttribute("data-nomobile", "true");
  });
});
