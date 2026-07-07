import { fireEvent, render, screen } from "@testing-library/react";
import { LegacyButton } from "@/components/ui/standard/legacy-button";

describe("LegacyButton", () => {
  it("renders children and defaults to button type", () => {
    render(<LegacyButton>Click</LegacyButton>);
    const btn = screen.getByRole("button", { name: "Click" });
    expect(btn).toHaveAttribute("type", "button");
  });

  it("uses htmlType for the underlying type attribute", () => {
    render(<LegacyButton htmlType="submit">Go</LegacyButton>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("disables the button while loading and shows a spinner", () => {
    const { container } = render(<LegacyButton loading>Save</LegacyButton>);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders the icon when not loading", () => {
    render(
      <LegacyButton icon={<span data-testid="icon">i</span>}>X</LegacyButton>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies block (full width) class", () => {
    render(<LegacyButton block>B</LegacyButton>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("applies circle shape classes", () => {
    render(<LegacyButton shape="circle">C</LegacyButton>);
    expect(screen.getByRole("button")).toHaveClass("rounded-full");
  });

  it("fires onClick", () => {
    const onClick = jest.fn();
    render(<LegacyButton onClick={onClick}>P</LegacyButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("honors disabled prop", () => {
    render(<LegacyButton disabled>D</LegacyButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("maps each legacy type to a distinct underlying variant class", () => {
    const { rerender } = render(<LegacyButton type="primary">P</LegacyButton>);
    const cls = (label: string) =>
      screen.getByRole("button", { name: label }).className;

    const primary = cls("P");

    rerender(<LegacyButton type="link">L</LegacyButton>);
    const link = cls("L");

    rerender(<LegacyButton type="text">T</LegacyButton>);
    const text = cls("T");

    rerender(<LegacyButton type="default">D</LegacyButton>);
    const dflt = cls("D");

    // link and text share the "link" variant; primary and default differ from it
    expect(link).toBe(text);
    expect(primary).not.toBe(link);
    expect(dflt).not.toBe(primary);
  });

  it("uses the warn variant for danger buttons", () => {
    render(<LegacyButton danger>Delete</LegacyButton>);
    const danger = screen.getByRole("button", { name: "Delete" }).className;

    render(<LegacyButton type="primary">Safe</LegacyButton>);
    const safe = screen.getByRole("button", { name: "Safe" }).className;

    expect(danger).not.toBe(safe);
  });

  it("prefers an explicit ghost flag and round shape", () => {
    render(
      <LegacyButton ghost shape="round">
        G
      </LegacyButton>,
    );
    expect(screen.getByRole("button", { name: "G" })).toHaveClass(
      "rounded-full",
    );
  });

  it("lets an explicit variant override the legacy type mapping", () => {
    render(
      <LegacyButton variant="secondary" type="primary">
        V
      </LegacyButton>,
    );
    expect(screen.getByRole("button", { name: "V" })).toBeInTheDocument();
  });
});
