import { render, screen } from "@testing-library/react";
import Permission from "@/app/components/Permission/Permission";
import { usePermission } from "@/lib/hooks/usePermission";

let mockState: any;
const mockUsePermission = usePermission as jest.Mock;

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

jest.mock("@/lib/hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

function setUser(user: any) {
  mockState = { user };
}

describe("Permission", () => {
  beforeEach(() => mockUsePermission.mockReturnValue(true));

  it("renders fallback when not logged in", () => {
    setUser({ uuid: "", currentTeam: null });
    render(
      <Permission fallback={<span>fb</span>}>
        <div>child</div>
      </Permission>,
    );
    expect(screen.getByText("fb")).toBeInTheDocument();
  });

  it("renders children for individual user without team", () => {
    setUser({ uuid: "u1", currentTeam: null });
    render(
      <Permission roles={["owner"] as any}>
        <div>child</div>
      </Permission>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("hides children when role check fails", () => {
    setUser({ uuid: "u1", currentTeam: { role: "basic" } });
    render(
      <Permission roles={["owner"] as any}>
        <div>child</div>
      </Permission>,
    );
    expect(screen.queryByText("child")).not.toBeInTheDocument();
  });

  it("hides children when resource permission is denied", () => {
    mockUsePermission.mockReturnValue(false);
    setUser({ uuid: "u1", currentTeam: { role: "owner" } });
    render(
      <Permission resourceGroup="g" resource="r" action="a">
        <div>child</div>
      </Permission>,
    );
    expect(screen.queryByText("child")).not.toBeInTheDocument();
  });

  it("renders children when both role and resource checks pass", () => {
    mockUsePermission.mockReturnValue(true);
    setUser({ uuid: "u1", currentTeam: { role: "owner" } });
    render(
      <Permission
        roles={["owner"] as any}
        resourceGroup="g"
        resource="r"
        action="a"
      >
        <div>child</div>
      </Permission>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("shows fallback on denied resource when hideOnNoPermission is false", () => {
    mockUsePermission.mockReturnValue(false);
    setUser({ uuid: "u1", currentTeam: { role: "owner" } });
    render(
      <Permission
        resourceGroup="g"
        resource="r"
        action="a"
        hideOnNoPermission={false}
        fallback={<span>fb</span>}
      >
        <div>child</div>
      </Permission>,
    );
    expect(screen.getByText("fb")).toBeInTheDocument();
  });
});
