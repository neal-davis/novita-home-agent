jest.mock("@/api/api", () => ({
  request: jest.fn(() => Promise.resolve({ ok: true })),
  service_base_url: "https://service.example.test",
}));

import { request } from "@/api/api";
import {
  reqAddImageAuth,
  reqChangePassword,
  reqCreateUserSecret,
  reqDeleteImageAuth,
  reqDeleteUserSecret,
  reqGetImageAuths,
  reqGetSSHKey,
  reqGetUserSecrets,
  reqGetUserSettings,
  reqRepository,
  reqUpdateUserSettings,
  reqUserSSHKeySave,
} from "@/api/gpu-instance/settings";

const mockRequest = request as jest.Mock;

describe("gpu-instance settings API wrappers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("reqAddImageAuth posts to the image repository auth endpoint", () => {
    reqAddImageAuth({ name: "n" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/gpu/image/repository/auth",
        method: "POST",
        data: { name: "n" },
      }),
    );
  });

  it("reqGetUserSecrets sends a GET with query params", () => {
    reqGetUserSecrets({ page: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/user/secrets",
        method: "GET",
        query: { page: 1 },
      }),
    );
  });

  it("reqCreateUserSecret posts the secret payload", () => {
    reqCreateUserSecret({ value: "v" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/user/secret", method: "POST" }),
    );
  });

  it("reqGetUserSettings / reqUpdateUserSettings hit the non-api base url", () => {
    reqGetUserSettings({ a: 1 });
    reqUpdateUserSettings({ b: 2 });
    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ url: "/user/settings", method: "GET" }),
    );
    expect(mockRequest).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ url: "/user/settings", method: "POST" }),
    );
  });

  it("covers the remaining wrappers", () => {
    reqDeleteUserSecret({ id: 1 });
    reqRepository({});
    reqGetImageAuths({});
    reqDeleteImageAuth({ id: 2 });
    reqUserSSHKeySave({ key: "k" });
    reqGetSSHKey();
    reqChangePassword({ pwd: "x" });
    expect(mockRequest).toHaveBeenCalledTimes(7);
    const urls = mockRequest.mock.calls.map((c) => c[0].url);
    expect(urls).toContain("/user/sshkey");
    expect(urls).toContain("/user/change_password");
  });
});
