import * as PermissionIndex from "@/app/components/Permission";

jest.mock("@/store", () => ({ useAppSelector: jest.fn() }));
jest.mock("@/lib/hooks/usePermission", () => ({ usePermission: jest.fn() }));

describe("Permission index barrel", () => {
  it("re-exports all permission components", () => {
    expect(typeof PermissionIndex.Permission).toBe("function");
    expect(typeof PermissionIndex.RolePermission).toBe("function");
    expect(typeof PermissionIndex.CombinedPermission).toBe("function");
    expect(typeof PermissionIndex.PermissionWrapper).toBe("function");
    expect(typeof PermissionIndex.NoPermission).toBe("function");
  });
});
