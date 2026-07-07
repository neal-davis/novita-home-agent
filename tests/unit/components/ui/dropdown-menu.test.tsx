import { fireEvent, render, screen } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuWithTriggerType,
} from "@/components/ui/dropdown-menu";

describe("DropdownMenu", () => {
  it("renders items when open", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("hides items when closed", () => {
    render(
      <DropdownMenu open={false}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("fires the item onSelect handler", () => {
    const onSelect = jest.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Run</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByText("Run"));
    expect(onSelect).toHaveBeenCalled();
  });

  it("DropdownMenuShortcut renders text", () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("DropdownMenuWithTriggerType opens on click by default", () => {
    render(
      <DropdownMenuWithTriggerType trigger={<button>Open</button>}>
        <DropdownMenuItem>Choice</DropdownMenuItem>
      </DropdownMenuWithTriggerType>,
    );
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Choice")).toBeInTheDocument();
  });

  it("DropdownMenuWithTriggerType opens on hover when configured", () => {
    render(
      <DropdownMenuWithTriggerType
        triggerType="hover"
        trigger={<button>Hover me</button>}
      >
        <DropdownMenuItem>HoverChoice</DropdownMenuItem>
      </DropdownMenuWithTriggerType>,
    );
    fireEvent.mouseEnter(screen.getByText("Hover me"));
    expect(screen.getByText("HoverChoice")).toBeInTheDocument();
  });
});
