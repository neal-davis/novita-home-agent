import { isBlogRevalidateAuthorized } from "@/app/api/blog/revalidate/auth";

const ORIGINAL_ENV = process.env;

describe("isBlogRevalidateAuthorized", () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      CRON_SECRET: "cron-secret",
      BLOG_REVALIDATE_SECRET: "manual-secret",
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("accepts the Vercel cron Authorization header", () => {
    expect(isBlogRevalidateAuthorized("Bearer cron-secret", null)).toBe(true);
  });

  it("accepts the manual revalidate secret query", () => {
    expect(isBlogRevalidateAuthorized(null, "manual-secret")).toBe(true);
  });

  it("rejects wrong or missing credentials", () => {
    expect(isBlogRevalidateAuthorized(null, null)).toBe(false);
    expect(isBlogRevalidateAuthorized("Bearer nope", "nope")).toBe(false);
  });

  it("rejects everything when no secrets are configured", () => {
    delete process.env.CRON_SECRET;
    delete process.env.BLOG_REVALIDATE_SECRET;
    expect(isBlogRevalidateAuthorized("Bearer x", "y")).toBe(false);
  });
});
