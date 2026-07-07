import { initBrevo } from "@/app/components/analytics/brevo";

describe("analytics/brevo initBrevo", () => {
  const user = {
    email: "user@example.com",
    uid: 42,
    role: 1,
    uuid: "uuid-123",
  };

  afterEach(() => {
    delete (window as any).sendinblue;
    delete (window as any).__user__;
  });

  it("identifies the user and stores __user__ when sendinblue exists", () => {
    const identify = jest.fn();
    (window as any).sendinblue = { identify };

    initBrevo(user);

    expect(identify).toHaveBeenCalledWith("user@example.com", {
      uid: 42,
      role: 1,
      uuid: "uuid-123",
    });
    expect((window as any).__user__).toEqual({ email: "user@example.com" });
  });

  it("does nothing when sendinblue is absent", () => {
    initBrevo(user);
    expect((window as any).__user__).toBeUndefined();
  });

  it("does nothing when email is empty", () => {
    const identify = jest.fn();
    (window as any).sendinblue = { identify };
    initBrevo({ ...user, email: "" });
    expect(identify).not.toHaveBeenCalled();
    expect((window as any).__user__).toBeUndefined();
  });
});
