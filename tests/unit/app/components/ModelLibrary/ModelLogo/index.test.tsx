import * as React from "react";
import { render, screen } from "@testing-library/react";

import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => (
    <img
      data-testid="model-logo-image"
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  ),
}));

jest.mock("@lobehub/icons", () => {
  const Icon = ({ size }: { size?: number }) => (
    <svg data-testid="model-logo-icon" data-size={size} />
  );
  return {
    Baichuan: { Color: Icon },
    Exa: { Color: Icon },
    Hunyuan: { Color: Icon },
    Microsoft: { Color: Icon },
    Mistral: { Color: Icon },
    Moonshot: Icon,
    OpenAI: Icon,
    Wenxin: { Color: Icon },
  };
});

describe("ModelLogo", () => {
  it("uses vendorName when modelName does not match any logo", () => {
    render(<ModelLogo modelName="unknown-model" vendorName="OpenAI" />);

    const image = screen.queryByTestId("model-logo-image");
    const icon = screen.getByTestId("model-logo-icon");

    expect(image).not.toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });

  it("falls back to the modelName first letter when neither modelName nor vendorName matches", () => {
    render(
      <ModelLogo
        modelName="unknown-model"
        vendorName="unknown-vendor"
        size={32}
      />,
    );

    expect(screen.queryByTestId("model-logo-image")).not.toBeInTheDocument();
    expect(screen.queryByTestId("model-logo-icon")).not.toBeInTheDocument();
    expect(screen.getByText("U")).toBeInTheDocument();
  });
});
