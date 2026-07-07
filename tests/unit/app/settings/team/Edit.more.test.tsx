import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const editTeamMember = jest.fn();
jest.mock("@/api/team", () => ({
  editTeamMember: (...a: unknown[]) => editTeamMember(...a),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

const mockPermissionsOpen = jest.fn();
jest.mock("@/app/settings/team/Permissions", () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) => {
    mockPermissionsOpen(open);
    return open ? <div data-testid="permissions-open" /> : null;
  },
}));

jest.mock("@/app/settings/team/index", () => ({
  genRoleCards: () => [
    { value: "basic", title: "Basic", desc: "basic role" },
    { value: "admin", title: "Admin", desc: "admin role" },
  ],
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

import Edit from "@/app/settings/team/Edit";

const onOpenChange = jest.fn();
const onSuccess = jest.fn();

describe("Edit (more branches)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("opens the permission details modal", () => {
    render(
      <Edit
        open
        memID="mem-1"
        oriRole={"basic" as any}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );
    fireEvent.click(screen.getByText("View permission details"));
    expect(screen.getByTestId("permissions-open")).toBeInTheDocument();
  });

  it("saves the role selected via a role card click", async () => {
    editTeamMember.mockResolvedValueOnce({});
    render(
      <Edit
        open
        memID="mem-1"
        oriRole={"basic" as any}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );
    // Switch role by clicking the Admin card
    fireEvent.click(screen.getByText("Admin"));
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(editTeamMember).toHaveBeenCalledWith("mem-1", "admin"),
    );
  });

  it("closes without saving when Cancel is clicked", () => {
    render(
      <Edit
        open
        memID="mem-1"
        oriRole={"basic" as any}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(editTeamMember).not.toHaveBeenCalled();
  });

  it("resets the selected role when the oriRole prop changes", async () => {
    editTeamMember.mockResolvedValue({});
    const { rerender } = render(
      <Edit
        open
        memID="mem-1"
        oriRole={"basic" as any}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );
    // Re-render with a new original role; the useEffect should sync state to it
    rerender(
      <Edit
        open
        memID="mem-2"
        oriRole={"admin" as any}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(editTeamMember).toHaveBeenCalledWith("mem-2", "admin"),
    );
  });
});
