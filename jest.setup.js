// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

process.env.NEXT_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dev-api-server.novita.ai";
process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://dev-api.novita.ai";
process.env.NEXT_PUBLIC_ENV = process.env.NEXT_PUBLIC_ENV || "test";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt = "", ...props }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...props} />;
  },
}));

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }
  observe(target) {
    this.callback([{ isIntersecting: true, target }]);
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

Object.defineProperty(window, "ResizeObserver", {
  configurable: true,
  writable: true,
  value: ResizeObserverMock,
});

Object.defineProperty(window, "IntersectionObserver", {
  configurable: true,
  writable: true,
  value: IntersectionObserverMock,
});

Object.defineProperty(global, "IntersectionObserver", {
  configurable: true,
  writable: true,
  value: IntersectionObserverMock,
});

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: jest.fn(() => null),
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ data: [], items: [], list: [], total: 0 }),
    text: async () => "",
    headers: new Headers(),
  }),
);
