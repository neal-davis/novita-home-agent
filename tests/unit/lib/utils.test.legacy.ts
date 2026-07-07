import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps custom font-size tokens when combined with text colors", () => {
    const className = cn("text-paragraph-12", "text-white");

    expect(className).toContain("text-paragraph-12");
    expect(className).toContain("text-white");
  });

  it("keeps the last custom font-size token like native tailwind text sizes", () => {
    const className = cn("text-paragraph-13", "text-paragraph-12");

    expect(className).not.toContain("text-paragraph-13");
    expect(className).toContain("text-paragraph-12");
  });
});
