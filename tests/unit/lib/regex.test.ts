import {
  RegexChinese,
  RegexCreditCode,
  RegexEmail,
  RegexIdNumber,
  RegexPassword,
  filterReffer,
  validateAllowedCharacters,
  validateComplexity,
  validateLength,
  validatePhoneNumber,
  validateTwoDecimalPlaces,
  validateUsername,
} from "@/lib/regex";

describe("filterReffer", () => {
  it("extracts the host from a URL", () => {
    expect(filterReffer("https://www.novita.ai/path")).toBe("novita.ai");
    expect(filterReffer("http://example.com/a/b")).toBe("example.com");
  });
  it("returns the input unchanged when it does not match", () => {
    expect(filterReffer("not a url")).toBe("not a url");
  });
});

describe("validateUsername", () => {
  it("accepts a valid alphanumeric username of allowed length", () => {
    expect(validateUsername("user_1")).toBe(true);
  });
  it("rejects too-short usernames", () => {
    expect(validateUsername("ab")).toBe(false);
  });
  it("rejects usernames with no letters", () => {
    expect(validateUsername("123456")).toBe(false);
  });
});

describe("validateTwoDecimalPlaces", () => {
  it.each([
    ["10", true],
    ["10.5", true],
    ["10.55", true],
    ["10.555", false],
    ["abc", false],
  ])("validates %s -> %s", (input, expected) => {
    expect(validateTwoDecimalPlaces(input)).toBe(expected);
  });
});

describe("RegexEmail", () => {
  it("accepts valid emails and rejects invalid", () => {
    expect(RegexEmail("a@b.com")).toBe(true);
    expect(RegexEmail("bad@")).toBe(false);
    expect(RegexEmail("no-at-sign")).toBe(false);
  });
});

describe("RegexPassword", () => {
  it("requires letters, digits and a special char", () => {
    expect(RegexPassword("Abcd1234!")).toBe(true);
    expect(RegexPassword("alllowercase")).toBe(false);
    expect(RegexPassword("short1!")).toBe(false);
  });
});

describe("RegexIdNumber", () => {
  it("validates an 18-digit Chinese ID format", () => {
    expect(RegexIdNumber("11010119900307001X")).toBe(true);
    expect(RegexIdNumber("123")).toBe(false);
  });
});

describe("RegexChinese", () => {
  it("matches only Chinese characters", () => {
    expect(RegexChinese("中文")).toBe(true);
    expect(RegexChinese("abc")).toBe(false);
  });
});

describe("RegexCreditCode", () => {
  it("matches an 18-char uppercase alphanumeric code", () => {
    expect(RegexCreditCode("91350100M000100Y43")).toBe(true);
    expect(RegexCreditCode("lowercase000000000")).toBe(false);
  });
});

describe("password validators", () => {
  it("validateLength enforces 8-32 chars", () => {
    expect(validateLength("12345678")).toBe(true);
    expect(validateLength("short")).toBe(false);
  });
  it("validateComplexity needs at least 3 character classes", () => {
    expect(validateComplexity("Abcd1234")).toBe(true);
    expect(validateComplexity("abcdefgh")).toBe(false);
  });
  it("validateAllowedCharacters rejects disallowed characters", () => {
    expect(validateAllowedCharacters("Abc123!@")).toBe(true);
    expect(validateAllowedCharacters("with space")).toBe(false);
  });
});

describe("validatePhoneNumber", () => {
  it("validates Chinese mobile numbers", () => {
    expect(validatePhoneNumber("13800138000")).toBe(true);
    expect(validatePhoneNumber("12345")).toBe(false);
  });
});
