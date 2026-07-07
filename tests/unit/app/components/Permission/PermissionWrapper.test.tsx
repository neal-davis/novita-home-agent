import { render, screen } from "@testing-library/react";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
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

describe("PermissionWrapper", () => {
  it("renders children when not logged in but loginRequired is false", () => {
    mockUsePermission.mockReturnValue(false);
    setUser({ uuid: "", currentTeam: null });
    render(
      <PermissionWrapper
        resourceGroup="g"
        resource="r"
        action="a"
        loginRequired={false}
      >
        <div>child</div>
      </PermissionWrapper>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("renders nothing when not logged in and login is required", () => {
    mockUsePermission.mockReturnValue(true);
    setUser({ uuid: "", currentTeam: null });
    const { container } = render(
      <PermissionWrapper resourceGroup="g" resource="r" action="a">
        <div>child</div>
      </PermissionWrapper>,
    );
    expect(screen.queryByText("child")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the no-permission notice when permission is denied", () => {
    mockUsePermission.mockReturnValue(false);
    setUser({ uuid: "u1", currentTeam: { role: "basic" } });
    const { container } = render(
      <PermissionWrapper resourceGroup="g" resource="r" action="a">
        <div>child</div>
      </PermissionWrapper>,
    );
    expect(screen.queryByText("child")).not.toBeInTheDocument();
    expect(screen.getByAltText("no permission")).toBeInTheDocument();
    expect(container.querySelector(".font-bold")).toHaveTextContent("Basic");
  });

  it("renders children when permission is granted", () => {
    mockUsePermission.mockReturnValue(true);
    setUser({ uuid: "u1", currentTeam: { role: "owner" } });
    render(
      <PermissionWrapper resourceGroup="g" resource="r" action="a">
        <div>child</div>
      </PermissionWrapper>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
