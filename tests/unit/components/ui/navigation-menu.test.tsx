import { render, screen } from "@testing-library/react";
import {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

describe("NavigationMenu", () => {
  it("renders triggers and links with forwarded class names", () => {
    render(
      <NavigationMenu className="nav-root">
        <NavigationMenuList className="nav-list">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="trigger-x">
              Products
            </NavigationMenuTrigger>
            <NavigationMenuContent className="content-x">
              <NavigationMenuLink href="/a">Item A</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );

    const trigger = screen.getByText("Products");
    expect(trigger).toBeInTheDocument();
    // navigationMenuTriggerStyle classes applied to the trigger button
    expect(trigger.closest("button")).toHaveClass("trigger-x");
  });

  it("exposes a trigger-style helper that returns a class string", () => {
    const cls = navigationMenuTriggerStyle();
    expect(typeof cls).toBe("string");
    expect(cls).toContain("inline-flex");
  });
});
