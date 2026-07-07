/**
 * GPU Application banner slides — normalized for client display.
 * Raw data comes from `getGPUBannerConfigInServerEnv()` (server-only fetch).
 */
export type GpuBannerSlide = {
  icon: string;
  title: string;
  desc: string;
  highlight: string;
  buttonText: string;
  href: string;
  bgColor: string;
};

/**
 * Map Strapi / CMS entries from `/gpu-banner-configs` into UI fields.
 * Field names follow common Strapi patterns; extend as the content model evolves.
 */
export function mapGpuBannerRawToSlides(raw: unknown): GpuBannerSlide[] {
  if (!Array.isArray(raw)) return [];
  const slides: GpuBannerSlide[] = [];
  for (const item of raw) {
    const a = item?.attributes ?? item;
    if (!a || typeof a !== "object") continue;
    const rec = a as Record<string, unknown>;
    const title = String(rec.title ?? "").trim();
    const href = String(rec.href ?? rec.url ?? rec.link ?? "").trim();
    if (!title && !href) continue;
    slides.push({
      icon: String(rec.icon ?? rec.iconUrl ?? rec.image ?? ""),
      title: title || "—",
      desc: String(rec.desc ?? rec.description ?? ""),
      highlight: String(rec.highlight ?? ""),
      buttonText: String(rec.buttonText ?? ""),
      href: href || "#",
      bgColor: String(rec.bgColor ?? rec.backgroundColor ?? "#397B5C"),
    });
  }
  return slides;
}
