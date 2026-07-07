import { NOVITA_URL } from "@/constants/urls";
import { urlMap } from "@/urlRedirect";

describe("urlRedirect urlMap", () => {
  it("redirects legacy model API routes to current model library routes", () => {
    expect(urlMap["/api-catalogue"]).toBe(NOVITA_URL.MODEL_LIBRARY_INDEX);
    expect(urlMap["/model-api/api-catalogue"]).toBe(
      NOVITA_URL.MODEL_LIBRARY_INDEX,
    );
    expect(urlMap["/model/upload"]).toBe(NOVITA_URL.MODEL_API_CONSOLE_MODEL);
    expect(urlMap["/model/:id"]).toBe("/model-api/model/:id");
  });

  it("redirects legacy GPU console and billing routes", () => {
    expect(urlMap["/gpu-instance/console/explore"]).toBe(
      NOVITA_URL.GPU_CONSOLE_EXPLORE,
    );
    expect(urlMap["/gpu-instance/console/instances"]).toBe(
      NOVITA_URL.GPU_CONSOLE_INSTANCES,
    );
    expect(urlMap["/gpu-instance/console/billing"]).toBe(
      NOVITA_URL.BILLING_DETAILS,
    );
    expect(urlMap["/billing/payment-methods"]).toBe(NOVITA_URL.BILLING_PAYMENT);
  });

  it("redirects retired product pages to active destinations", () => {
    expect(urlMap["/product/video-remove-watermark"]).toBe(NOVITA_URL.HOME);
    expect(urlMap["/model-api/product/video-upscale"]).toBe(NOVITA_URL.HOME);
    expect(urlMap["/model-api/product/txt2speech"]).toBe(
      NOVITA_URL.MODEL_API_VOICE_PLAYGROUND,
    );
    expect(urlMap["/gpu-instance/pricing"]).toBe(`${NOVITA_URL.PRICING}?gpu=1`);
  });
});
