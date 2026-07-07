import { render, screen } from "@testing-library/react";
import RolePermission from "@/app/components/Permission/RolePermission";

let mockState: any;

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

function setUser(user: any) {
  mockState = { user };
}

describe("RolePermission", () => {
  it("renders fallback when no user is logged in", () => {
    setUser({ uuid: "", currentTeam: null });
    render(
      <RolePermission roles={["owner"] as any} fallback={<span>fb</span>}>
        <div>child</div>
      </RolePermission>,
    );
    expect(screen.getByText("fb")).toBeInTheDocument();
    expect(screen.queryByText("child")).not.toBeInTheDocument();
  });

  it("renders children for an individual user without team context", () => {
    setUser({ uuid: "u1", currentTeam: null });
    render(
      <RolePermission roles={["owner"] as any}>
        <div>child</div>
      </RolePermission>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders children when the team role is in the allowed list", () => {
    setUser({ uuid: "u1", currentTeam: { role: "admin" } });
    render(
      <RolePermission roles={["owner", "admin"] as any}>
        <div>child</div>
      </RolePermission>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("hides content when role not allowed and hideOnNoPermission is true", () => {
    setUser({ uuid: "u1", currentTeam: { role: "basic" } });
    const { container } = render(
      <RolePermission roles={["owner"] as any} fallback={<span>fb</span>}>
        <div>child</div>
      </RolePermission>,
    );
    expect(screen.queryByText("child")).not.toBeInTheDocument();
    expect(screen.queryByText("fb")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it("shows fallback when role not allowed and hideOnNoPermission is false", () => {
    setUser({ uuid: "u1", currentTeam: { role: "basic" } });
    render(
      <RolePermission
        roles={["owner"] as any}
        hideOnNoPermission={false}
        fallback={<span>fb</span>}
      >
        <div>child</div>
      </RolePermission>,
    );
    expect(screen.getByText("fb")).toBeInTheDocument();
  });
});
