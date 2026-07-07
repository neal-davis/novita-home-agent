import {
  validateCNPhone,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/utils/validators";

describe("validation utilities", () => {
  it("validates email shape without accepting missing parts", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("user.name+tag@example.co")).toBe(true);
    expect(validateEmail("user@example")).toBe(false);
    expect(validateEmail("user @example.com")).toBe(false);
  });

  it("validates usernames by length, characters and required letters", () => {
    expect(validateUsername("user_01")).toBe(true);
    expect(validateUsername("用户-01")).toBe(true);
    expect(validateUsername("12345")).toBe(false);
    expect(validateUsername("abcd")).toBe(false);
    expect(validateUsername("valid user")).toBe(false);
  });

  it("requires strong passwords with bounded length", () => {
    expect(validatePassword("Aa1!aaaa")).toBe(true);
    expect(validatePassword("aa1!aaaa")).toBe(false);
    expect(validatePassword("AA1!AAAA")).toBe(false);
    expect(validatePassword("Aa!!aaaa")).toBe(false);
    expect(validatePassword("Aa1aaaaa")).toBe(false);
  });

  it("validates mainland China phone numbers from strings and numbers", () => {
    expect(validateCNPhone("13800138000")).toBe(true);
    expect(validateCNPhone(19912345678)).toBe(true);
    expect(validateCNPhone("12800138000")).toBe(false);
    expect(validateCNPhone("1380013800")).toBe(false);
  });
});
