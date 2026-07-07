import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const editTeamMember = jest.fn();
jest.mock("@/api/team", () => ({
  editTeamMember: (...a: unknown[]) => editTeamMember(...a),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/app/settings/team/Permissions", () => () => null);

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
import { message } from "@/components/ui/standard/notify";

const onOpenChange = jest.fn();
const onSuccess = jest.fn();

function renderEdit() {
  return render(
    <Edit
      open
      memID="mem-1"
      oriRole={"basic" as any}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />,
  );
}

describe("Edit", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders both role cards", () => {
    renderEdit();
    expect(screen.getByText("Basic")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("saves the original role and reports success", async () => {
    editTeamMember.mockResolvedValueOnce({});
    renderEdit();
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(editTeamMember).toHaveBeenCalledWith("mem-1", "basic");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("reports an error on failure", async () => {
    editTeamMember.mockRejectedValueOnce(new Error("nope"));
    renderEdit();
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith("Failed to update role"),
    );
  });
});
