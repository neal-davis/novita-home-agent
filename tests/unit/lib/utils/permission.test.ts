const mockDispatch = jest.fn();
const mockGetState = jest.fn();
const mockSetInfoDialog = jest.fn((payload) => ({
  payload,
  type: "config/setInfoDialog",
}));

jest.mock("@/store", () => ({
  reduxStore: {
    store: {
      dispatch: (...args: unknown[]) => mockDispatch(...args),
      getState: () => mockGetState(),
    },
  },
}));

jest.mock("@/store/slice/configSlice", () => ({
  setInfoDialog: (payload: unknown) => mockSetInfoDialog(payload),
}));

import {
  checkGroupPermissions,
  checkPermission,
  hasPermission,
  showPermissionMessage,
} from "@/lib/utils/permission";

const readBilling = {
  action: "read",
  resource: "billing",
  resource_group: "finance",
};

describe("permission utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetState.mockReturnValue({
      config: {
        permissionsConfig: {
          admin: [
            {
              action: "*",
              resource: "*",
              resource_group: "finance",
            },
          ],
          developer: [
            {
              action: "read",
              resource: "instances",
              resource_group: "compute",
            },
          ],
        },
      },
      user: {
        currentTeam: { id: "team-1", name: "Team", role: "admin" },
        uuid: "user-1",
      },
    });
  });

  it("denies missing users, allows personal accounts, and matches exact or wildcard ACLs", () => {
    expect(checkPermission({}, readBilling, "", null)).toBe(false);
    expect(checkPermission({}, readBilling, "user-1", null)).toBe(true);

    expect(
      checkPermission(
        {
          admin: [
            {
              action: "*",
              resource: "*",
              resource_group: "finance",
            },
          ],
        },
        readBilling,
        "user-1",
        { id: "team-1", name: "Team", role: "admin" as any },
      ),
    ).toBe(true);

    expect(
      checkPermission(
        {
          developer: [
            {
              action: "read",
              resource: "instances",
              resource_group: "compute",
            },
          ],
        },
        readBilling,
        "user-1",
        { id: "team-1", name: "Team", role: "developer" as any },
      ),
    ).toBe(false);
  });

  it("reads Redux state for direct permission checks and grouped permissions", () => {
    expect(hasPermission(readBilling)).toBe(true);
    expect(checkGroupPermissions(["finance", "compute", "storage"])).toEqual({
      compute: false,
      finance: true,
      storage: false,
    });

    mockGetState.mockReturnValueOnce({
      config: { permissionsConfig: {} },
      user: { currentTeam: null, uuid: "user-1" },
    });
    expect(checkGroupPermissions(["finance"])).toEqual({ finance: true });

    mockGetState.mockReturnValueOnce({
      config: { permissionsConfig: {} },
      user: { currentTeam: { role: "unknown" } },
    });
    expect(checkGroupPermissions(["finance"])).toEqual({ finance: true });
  });

  it("dispatches a role-aware permission dialog", () => {
    showPermissionMessage("/settings/team");

    expect(mockSetInfoDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmRedirect: "/settings/team",
        description: expect.stringContaining("Admin role"),
        emphasisContent: "Admin",
        title: "Permission Required",
      }),
    );
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: expect.objectContaining({ emphasisContent: "Admin" }),
      type: "config/setInfoDialog",
    });
  });
});
