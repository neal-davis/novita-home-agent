jest.mock("@/api/api", () => ({
  request: jest.fn(() => Promise.resolve({ ok: true })),
  service_base_url: "https://service.example.test",
}));

import { request } from "@/api/api";
import {
  reqEmailLogin,
  reqUpdateUserInfo,
  reqUserInfo,
} from "@/api/gpu-instance/userInfo";

const mockRequest = request as jest.Mock;

describe("gpu-instance userInfo API wrappers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("reqUserInfo issues a GET with query params", () => {
    reqUserInfo({ uid: 1 });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/user/info",
        method: "GET",
        query: { uid: 1 },
      }),
    );
  });

  it("reqEmailLogin posts credentials", () => {
    reqEmailLogin({ email: "a@b.com", password: "p" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/user/email_login",
        method: "POST",
        data: { email: "a@b.com", password: "p" },
      }),
    );
  });

  it("reqUpdateUserInfo posts the update payload", () => {
    reqUpdateUserInfo({ name: "new" });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/user/userinfo/update",
        method: "POST",
        data: { name: "new" },
      }),
    );
  });
});
