import { render, screen } from "@testing-library/react";
import NoPermission from "@/app/components/Permission/noPermission";

let mockState: any;

jest.mock("@/store", () => ({
  useAppSelector: (sel: any) => sel(mockState),
}));

function setUser(user: any) {
  mockState = { user };
}

describe("NoPermission", () => {
  it("renders nothing when there is no logged-in user", () => {
    setUser({ uuid: "", currentTeam: null });
    const { container } = render(<NoPermission />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the role-specific notice for a logged-in user", () => {
    setUser({ uuid: "u1", currentTeam: { role: "developer" } });
    const { container } = render(<NoPermission />);
    expect(screen.getByAltText("no permission")).toBeInTheDocument();
    expect(container.querySelector(".font-bold")).toHaveTextContent(
      "Developer",
    );
  });

  it("emphasizes the role text in bold spans", () => {
    setUser({ uuid: "u1", currentTeam: { role: "admin" } });
    const { container } = render(<NoPermission />);
    const bold = container.querySelector(".font-bold");
    expect(bold).toHaveTextContent("Admin");
  });
});
