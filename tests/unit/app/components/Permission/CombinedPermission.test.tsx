import { render, screen } from "@testing-library/react";
import CombinedPermission from "@/app/components/Permission/CombinedPermission";
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

describe("CombinedPermission", () => {
  it("renders fallback when not logged in", () => {
    mockUsePermission.mockReturnValue(true);
    setUser({ uuid: "", currentTeam: null });
    render(
      <CombinedPermission fallback={<span>fb</span>}>
        <div>child</div>
      </CombinedPermission>,
    );
    expect(screen.getByText("fb")).toBeInTheDocument();
  });

  it("renders children for individual user without team", () => {
    mockUsePermission.mockReturnValue(false);
    setUser({ uuid: "u1", currentTeam: null });
    render(
      <CombinedPermission>
        <div>child</div>
      </CombinedPermission>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("requireAll=false grants when only role matches", () => {
    mockUsePermission.mockReturnValue(false);
    setUser({ uuid: "u1", currentTeam: { role: "owner" } });
    render(
      <CombinedPermission roles={["owner"] as any} requireAll={false}>
        <div>child</div>
      </CombinedPermission>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("requireAll=true denies when role matches but resource denied", () => {
    mockUsePermission.mockReturnValue(false);
    setUser({ uuid: "u1", currentTeam: { role: "owner" } });
    render(
      <CombinedPermission roles={["owner"] as any} requireAll={true}>
        <div>child</div>
      </CombinedPermission>,
    );
    expect(screen.queryByText("child")).not.toBeInTheDocument();
  });

  it("requireAll=true grants when both role and resource pass", () => {
    mockUsePermission.mockReturnValue(true);
    setUser({ uuid: "u1", currentTeam: { role: "owner" } });
    render(
      <CombinedPermission roles={["owner"] as any} requireAll={true}>
        <div>child</div>
      </CombinedPermission>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("shows fallback when denied and hideOnNoPermission is false", () => {
    mockUsePermission.mockReturnValue(false);
    setUser({ uuid: "u1", currentTeam: { role: "basic" } });
    render(
      <CombinedPermission
        roles={["owner"] as any}
        requireAll={false}
        hideOnNoPermission={false}
        fallback={<span>fb</span>}
      >
        <div>child</div>
      </CombinedPermission>,
    );
    expect(screen.getByText("fb")).toBeInTheDocument();
  });
});
