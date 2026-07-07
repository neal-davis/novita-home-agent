import { checkUserPassword } from "@/lib/utils/password";

describe("checkUserPassword", () => {
  it.each([
    ["Abcdef1!", true],
    ["ABCDEFG1!", true],
    ["abcdefg1!", true],
    ["Abcdefgh", false],
    ["Abc1!", false],
    ["abcdefgh", false],
    ["ABCDEFGH", false],
    ["12345678", false],
  ])("validates %p as %p", (password, expected) => {
    expect(checkUserPassword(password)).toBe(expected);
  });
});
