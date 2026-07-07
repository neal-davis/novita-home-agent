import { isValidElement } from "react";
import { render } from "@testing-library/react";
import {
  capitalizeModal,
  isModelSupportPromptCache,
  isMultimodalModel,
  renderInputToken,
  renderInputUnitPrice,
  renderOutputToken,
  renderOutputUnitPrice,
} from "@/app/billing/billing-details/components/billTokenPriceFieldRenderers";

const renderNode = (node: React.ReactNode) => render(<div>{node}</div>);

const expectDetailNode = (
  node: React.ReactNode,
  expectedDisplayValue: string,
  expectedLabels: string[],
) => {
  expect(isValidElement(node)).toBe(true);
  if (!isValidElement(node)) return;

  expect(node.props.displayValue).toBe(expectedDisplayValue);
  expect(
    node.props.details.map((detail: { label: string }) => detail.label),
  ).toEqual(expect.arrayContaining(expectedLabels));
};

describe("billTokenPriceFieldRenderers - predicates", () => {
  it("isMultimodalModel only true for billingMethod 7", () => {
    expect(isMultimodalModel(7)).toBe(true);
    expect(isMultimodalModel(1)).toBe(false);
  });

  it("isModelSupportPromptCache true when discountPrice2 or 3 positive", () => {
    expect(isModelSupportPromptCache({ discountPrice2: 5 })).toBeTruthy();
    expect(isModelSupportPromptCache({ discountPrice3: 5 })).toBeTruthy();
    expect(
      isModelSupportPromptCache({ discountPrice2: 0, discountPrice3: 0 }),
    ).toBeFalsy();
    expect(isModelSupportPromptCache({})).toBeFalsy();
  });

  it("capitalizeModal maps known modals and capitalizes unknown", () => {
    expect(capitalizeModal("text")).toBe("Text");
    expect(capitalizeModal("AUDIO")).toBe("Audio");
    expect(capitalizeModal("foo")).toBe("Foo");
    expect(capitalizeModal("BAR")).toBe("Bar");
  });
});

describe("renderInputToken branches", () => {
  it("multimodal model returns detail with display value", () => {
    expectDetailNode(
      renderInputToken({
        billingMethod: 7,
        billNum0: 100,
        billNum15: 6,
        billNum2: 7,
        billNum3: 8,
        billNum5: 1,
        billNum7: 2,
        billNum9: 3,
        billNum11: 4,
      }),
      "31",
      [
        "Text input uncached",
        "Text input cached read",
        "Text input cached write(5m)",
        "Text input cached write(1h)",
        "Image input",
      ],
    );
  });

  it("prompt-cache model returns summed total", () => {
    const { getByText } = renderNode(
      renderInputToken({
        billingMethod: 1,
        discountPrice2: 5,
        billNum0: 1,
        billNum2: 2,
        billNum3: 3,
        billNum5: 4,
      }),
    );
    // 1+2+3+4 = 10
    expect(getByText("10")).toBeInTheDocument();
  });

  it("falls back to raw billNum0 for plain models", () => {
    const result = renderInputToken({ billingMethod: 1, billNum0: 42 });
    expect(result).toBe(42);
  });
});

describe("renderOutputToken branches", () => {
  it("multimodal returns detail node", () => {
    expectDetailNode(
      renderOutputToken({
        billingMethod: 7,
        billNum1: 55,
        billNum6: 1,
        billNum10: 2,
        billNum12: 3,
        billNum8: 4,
      }),
      "10",
      ["Text output", "Image output", "Audio output", "Video output"],
    );
  });

  it("plain model returns raw billNum1", () => {
    expect(renderOutputToken({ billingMethod: 1, billNum1: 9 })).toBe(9);
  });
});

describe("renderInputUnitPrice branches", () => {
  it("multimodal with inputPrice maps modal rows (equal vs discounted)", () => {
    const node = renderInputUnitPrice(
      {
        billingMethod: 7,
        pricePrecision: 1,
        billNum15: 1,
        billNum2: 2,
        billNum3: 3,
        billNum5: 4,
        billNum7: 5,
        billNum9: 6,
        billNum11: 7,
        multimodalPricing: {
          inputPrice: [
            {
              modals: ["text"],
              input_token_discount_price: 100,
              input_token_base_price: 100,
            },
            {
              modals: ["image", "audio"],
              inputTokenDiscountPrice: 50,
              inputTokenBasePrice: 100,
            },
          ],
        },
      },
      "$",
    );
    expectDetailNode(node, "Detail", [
      "Text input uncached",
      "Text input cached read",
      "Text input cached write(5m)",
      "Text input cached write(1h)",
      "Image input",
    ]);
  });

  it("prompt-cache path renders the four cached rows with dashes for missing", () => {
    const node = renderInputUnitPrice(
      {
        billingMethod: 1,
        discountPrice2: 5,
        pricePrecision: 1,
        discountPrice0: 100,
        basePrice0: 200,
        basePrice2: 5,
        discountPrice3: 0,
        discountPrice5: 0,
      },
      "$",
    );
    expect(isValidElement(node)).toBe(true);
    renderNode(node);
  });

  it("prompt-cache path with all cached prices discounted (unequal) and present", () => {
    const node = renderInputUnitPrice(
      {
        billingMethod: 1,
        pricePrecision: 1,
        discountPrice0: 100,
        basePrice0: 200,
        discountPrice2: 50,
        basePrice2: 80,
        discountPrice3: 30,
        basePrice3: 60,
        discountPrice5: 20,
        basePrice5: 40,
      },
      "$",
    );
    expect(isValidElement(node)).toBe(true);
    renderNode(node);
  });

  it("prompt-cache path with all cached prices equal to base", () => {
    const node = renderInputUnitPrice(
      {
        billingMethod: 1,
        pricePrecision: 1,
        discountPrice0: 100,
        basePrice0: 100,
        discountPrice2: 80,
        basePrice2: 80,
        discountPrice3: 60,
        basePrice3: 60,
        discountPrice5: 40,
        basePrice5: 40,
      },
      "$",
    );
    expect(isValidElement(node)).toBe(true);
    renderNode(node);
  });

  it("tieredConfig path adds labelDesc and equal-price branch", () => {
    const node = renderInputUnitPrice(
      {
        billingMethod: 1,
        tieredConfig: { minTokens: 0, maxTokens: 100 },
        pricePrecision: 1,
        discountPrice0: 100,
        basePrice0: 100,
        discountPrice2: 10,
        basePrice2: 10,
        discountPrice3: 20,
        basePrice3: 30,
        discountPrice5: 40,
        basePrice5: 40,
      },
      "$",
    );
    expect(isValidElement(node)).toBe(true);
    renderNode(node);
  });

  it("multimodal input price with no original price uses discount string", () => {
    const node = renderInputUnitPrice(
      {
        billingMethod: 7,
        pricePrecision: 1,
        billNum15: 1,
        billNum7: 2,
        multimodalPricing: {
          inputPrice: [
            {
              modals: ["text"],
              inputTokenDiscountPrice: 80,
              inputTokenBasePrice: 0,
            },
            {
              modals: ["image"],
              input_token_discount_price: 50,
              input_token_base_price: 50,
            },
          ],
        },
      },
      "$",
    );
    expectDetailNode(node, "Detail", ["Text input uncached", "Image input"]);
  });

  it("default path equal price returns plain string", () => {
    const result = renderInputUnitPrice(
      {
        billingMethod: 1,
        discountPrice0: 100,
        basePrice0: 100,
        pricePrecision: 1,
      },
      "$",
    );
    expect(typeof result).toBe("string");
  });

  it("default path unequal price returns line-through node", () => {
    const { container } = renderNode(
      renderInputUnitPrice(
        {
          billingMethod: 1,
          discountPrice0: 50,
          basePrice0: 100,
          pricePrecision: 1,
        },
        "$",
      ),
    );
    expect(container.querySelector(".line-through")).toBeTruthy();
  });
});

describe("renderOutputUnitPrice branches", () => {
  it("multimodal with outputPrice maps rows (equal and discounted)", () => {
    const node = renderOutputUnitPrice(
      {
        billingMethod: 7,
        pricePrecision: 1,
        multimodalPricing: {
          outputPrice: [
            {
              modals: ["video"],
              output_token_discount_price: 100,
              output_token_base_price: 100,
            },
            {
              modals: ["text"],
              outputTokenDiscountPrice: 50,
              outputTokenBasePrice: 100,
            },
          ],
        },
      },
      "$",
    );
    expect(isValidElement(node)).toBe(true);
    renderNode(node);
  });

  it("tieredConfig output path equal price", () => {
    const node = renderOutputUnitPrice(
      {
        billingMethod: 1,
        tieredConfig: { outputMinTokens: 1, outputMaxTokens: 9 },
        pricePrecision: 1,
        discountPrice1: 100,
        basePrice1: 100,
      },
      "$",
    );
    expect(isValidElement(node)).toBe(true);
    renderNode(node);
  });

  it("tieredConfig output path discounted price renders node", () => {
    const node = renderOutputUnitPrice(
      {
        billingMethod: 1,
        tieredConfig: { outputMinTokens: 1, outputMaxTokens: 9 },
        pricePrecision: 1,
        discountPrice1: 50,
        basePrice1: 100,
      },
      "$",
    );
    expect(isValidElement(node)).toBe(true);
    renderNode(node);
  });

  it("default path equal returns string, unequal returns node", () => {
    expect(
      typeof renderOutputUnitPrice(
        {
          billingMethod: 1,
          discountPrice1: 10,
          basePrice1: 10,
          pricePrecision: 1,
        },
        "$",
      ),
    ).toBe("string");
    const { container } = renderNode(
      renderOutputUnitPrice(
        {
          billingMethod: 1,
          discountPrice1: 5,
          basePrice1: 10,
          pricePrecision: 1,
        },
        "$",
      ),
    );
    expect(container.querySelector(".line-through")).toBeTruthy();
  });
});
