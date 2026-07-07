import Image from "next/image";
import { PricingCampaignBanner } from "../../components/campaigns";

export default async function FirstPage() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-[var(--gray-50)]">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <Image
            src="/pricing/v5/pricing-hero-bg.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top"
            priority
            aria-hidden
          />
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-[80px] pointer-events-none"
          aria-hidden
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--gray-50))",
          }}
        />

        <div className="relative z-10 min-h-[520px] md:min-h-[700px]">
          <div className="mx-auto flex w-full max-w-[1512px] flex-col items-start px-[var(--spacing-layout-x)] pt-[128px] md:pt-[215px]">
            <div className="flex max-w-[700px] flex-col gap-[var(--space-20)] md:gap-[var(--space-24)]">
              <div className="flex items-center gap-[var(--space-8)]">
                <span
                  className="h-2 w-2 rounded-[2px] bg-[var(--brand-0)]"
                  aria-hidden
                />
                <span className="font-mono-13 text-[var(--dark-2)]">
                  Pricing
                </span>
              </div>

              <div className="flex flex-col gap-[var(--space-16)]">
                <h1 className="font-miletus text-[length:var(--display-sm-font-size)] font-[var(--display-sm-font-weight)] leading-[var(--display-sm-line-height)] text-[var(--text-1)] md:text-[length:var(--display-md-font-size)] md:font-[var(--display-md-font-weight)] md:leading-[var(--display-md-line-height)]">
                  Pricing to seamlessly scale from idea to enterprise
                </h1>
                <p className="font-miletus text-[length:var(--paragraph-16-font-size)] font-[var(--paragraph-16-font-weight)] leading-[var(--paragraph-16-line-height)] text-[var(--text-3)] max-w-[560px] md:text-[length:var(--paragraph-18-font-size)] md:font-[var(--paragraph-18-font-weight)] md:leading-[var(--paragraph-18-line-height)]">
                  Explore pricing for our Model APIs and GPU resources. Find the
                  right plan to match your needs with transparent rates and
                  flexible options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max_width_container">
        <div className="hidden md:block">
          <PricingCampaignBanner />
        </div>
        <div className="md:hidden">
          <PricingCampaignBanner type="mobile" />
        </div>
      </div>
    </>
  );
}
