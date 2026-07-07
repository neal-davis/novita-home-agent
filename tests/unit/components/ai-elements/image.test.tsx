import { render, screen } from "@testing-library/react";
import { Image } from "@/components/ai-elements/image";

describe("ai-elements Image", () => {
  it("builds a data URL from base64 and mediaType", () => {
    render(
      <Image
        base64="QUJD"
        uint8Array={new Uint8Array()}
        mediaType="image/png"
        alt="generated"
      />,
    );
    const img = screen.getByAltText("generated");
    expect(img).toHaveAttribute("src", "data:image/png;base64,QUJD");
  });

  it("merges a custom className", () => {
    render(
      <Image
        base64="eA=="
        uint8Array={new Uint8Array()}
        mediaType="image/jpeg"
        alt="x"
        className="img-x"
      />,
    );
    expect(screen.getByAltText("x")).toHaveClass("img-x");
  });
});
