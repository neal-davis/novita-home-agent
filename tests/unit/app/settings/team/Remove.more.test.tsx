import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

const removeTeamMember = jest.fn();
jest.mock("@/api/team", () => ({
  removeTeamMember: (...a: unknown[]) => removeTeamMember(...a),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { error: jest.fn(), success: jest.fn() },
}));

const mockTrackClick = jest.fn();
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: (...a: unknown[]) => mockTrackClick(...a) },
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

import Remove from "@/app/settings/team/Remove";

const onOpenChange = jest.fn();
const onSuccess = jest.fn();

describe("Remove (more branches)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("closes without removing when Cancel is clicked", () => {
    render(
      <Remove
        open
        memID="mem-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(removeTeamMember).not.toHaveBeenCalled();
  });

  it("tracks the confirm click before removing the member", () => {
    removeTeamMember.mockResolvedValueOnce({});
    render(
      <Remove
        open
        memID="mem-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />,
    );
    fireEvent.click(screen.getByText("Remove"));
    expect(mockTrackClick).toHaveBeenCalled();
    expect(removeTeamMember).toHaveBeenCalledWith("mem-1");
  });
});
