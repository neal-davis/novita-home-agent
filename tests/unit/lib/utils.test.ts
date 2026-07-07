import { cn, transformModelIdToPath } from "@/lib/utils";

describe("cn", () => {
  it("merges conditional classes and custom typography conflicts", () => {
    expect(
      cn(
        "font-heading-h1 text-black px-2",
        false && "hidden",
        "font-heading-h2 px-4",
      ),
    ).toBe("text-black font-heading-h2 px-4");
  });
});

describe("transformModelIdToPath", () => {
  it.each([
    ["vendor/model", "vendor-model"],
    ["vendor/family/model", "vendor-family-model"],
    ["", ""],
  ])("turns model id %p into path %p", (input, expected) => {
    expect(transformModelIdToPath(input)).toBe(expected);
  });
});
