import { render, screen } from "@testing-library/react";
import { CardItem } from "@/app/billing/overview/components/payment-methods/CardItem";

jest.mock(
  "@/app/billing/overview/components/payment-methods/index.module.scss",
  () => ({}),
  { virtual: true },
);

describe("CardItem", () => {
  it("renders brand, masked number and expiration", () => {
    render(
      <CardItem
        id="c1"
        brand="Visa"
        country="US"
        funding="credit"
        last4="4242"
        expMonth="9"
        expYear="2030"
      />,
    );
    expect(screen.getByText(/Visa/)).toBeInTheDocument();
    expect(screen.getByText(/4242/)).toBeInTheDocument();
    expect(screen.getByText(/Expiration: 9\/2030/)).toBeInTheDocument();
    expect(screen.getByAltText("Visa")).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <CardItem
        id="c2"
        brand="Mastercard"
        country="US"
        funding="credit"
        last4="1111"
        expMonth="1"
        expYear="2029"
        className="extra-class"
      />,
    );
    expect(container.querySelector(".extra-class")).toBeTruthy();
  });
});
