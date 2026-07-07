import { validateConfig } from "@/app/user/components/utils";

describe("user validateConfig", () => {
  it("validates email addresses", () => {
    expect(validateConfig.email("a@b.com")).toEqual([true, ""]);
    const [ok, msg] = validateConfig.email("not-email");
    expect(ok).toBe(false);
    expect(msg).toContain("valid email");
  });

  it("validates strong passwords", () => {
    expect(validateConfig.pwd("Abcdef1!")).toEqual([true, ""]);
    const [ok, msg] = validateConfig.pwd("weak");
    expect(ok).toBe(false);
    expect(msg).toContain("at least 8 characters");
  });

  it("requires a non-empty first name", () => {
    expect(validateConfig.firstName("Jane")).toEqual([true, ""]);
    expect(validateConfig.firstName("")).toEqual([
      false,
      "Please enter your first name.",
    ]);
  });

  it("requires a non-empty last name", () => {
    expect(validateConfig.lastName("Doe")).toEqual([true, ""]);
    expect(validateConfig.lastName("")).toEqual([
      false,
      "Please enter your last name.",
    ]);
  });
});
