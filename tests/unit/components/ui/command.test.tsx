import { render, screen } from "@testing-library/react";

// cmdk calls scrollIntoView on selected items; jsdom doesn't implement it.
beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";

describe("Command", () => {
  it("renders the input, group, items, and a shortcut with forwarded class names", () => {
    render(
      <Command className="custom-command" data-testid="cmd">
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem className="item-x">
              Calendar
              <CommandShortcut className="sc-x">⌘K</CommandShortcut>
            </CommandItem>
            <CommandSeparator />
            <CommandItem>Search</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();

    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();

    const shortcut = screen.getByText("⌘K");
    expect(shortcut.tagName).toBe("SPAN");
    expect(shortcut).toHaveClass("sc-x");
    expect(shortcut).toHaveClass("ml-auto");

    expect(screen.getByTestId("cmd")).toHaveClass("custom-command");
  });

  it("shows the empty state when no items match the query", () => {
    render(
      <Command>
        <CommandInput value="zzz-nomatch" onValueChange={() => {}} />
        <CommandList>
          <CommandEmpty>Nothing here</CommandEmpty>
          <CommandGroup>
            <CommandItem>Alpha</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
