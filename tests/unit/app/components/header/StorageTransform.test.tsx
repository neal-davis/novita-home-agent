import { render } from "@testing-library/react";
import { StorageTransform } from "@/app/components/header/StorageTransform";
import Cookies from "js-cookie";

const mockSet = jest.fn();
jest.mock("js-cookie", () => ({
  __esModule: true,
  default: { set: (...a: any[]) => mockSet(...a) },
}));

describe("StorageTransform", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("copies present localStorage attribution keys into cookies", () => {
    localStorage.setItem("source", "google");
    localStorage.setItem("utm_campaign", "spring");
    render(<StorageTransform />);
    expect(mockSet).toHaveBeenCalledWith("source", "google");
    expect(mockSet).toHaveBeenCalledWith("utm_campaign", "spring");
  });

  it("does not set cookies for keys missing from localStorage", () => {
    render(<StorageTransform />);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("renders no visible output", () => {
    const { container } = render(<StorageTransform />);
    expect(container).toBeEmptyDOMElement();
  });
});
