import Image from "next/image";
import LinkWithAuthority from "@/app/components/LinkWithAuthority";
import { AFFILIATE_PORTAL_URL } from "@/constants/urls";

export function Recommend() {
  return (
    <section className="bg-white relative overflow-hidden">
      {/* Background decorative elements for the second part */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large green circles */}
        <div className="absolute top-0 right-0 w-[847px] h-[836px] translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full border border-[var(--brand-1)] rounded-full opacity-20"></div>
        </div>
        <div className="absolute top-0 left-0 w-[847px] h-[862px] -translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full border border-[var(--brand-1)] rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Second part - Recommend Novita */}
      <div className="bg-[#F5F5F5] -mx-[calc(var(--spacing-layout-x))] px-[calc(var(--spacing-layout-x))] relative">
        {/* Recommend background image positioned at bottom left of this module */}
        <div className="absolute bottom-0 left-0 pointer-events-none">
          <Image
            src="/affiliate-new/recommend-bg.svg"
            alt="Recommend background decoration"
            width={200}
            height={200}
            className="w-auto h-auto"
          />
        </div>

        <div className="max_width_container">
          <div className="mx-web">
            <div className="flex justify-center lg:justify-end">
              <div className="w-full lg:w-[512px] space-y-8 text-center lg:text-left">
                {/* Main heading */}
                <div className="pt-[131px]">
                  <h2 className="text-3xl lg:text-5xl font-semibold text-[var(--dark-1)] leading-[1em] tracking-[-2%]">
                    Recommend Novita.
                    <br />
                    Earn Big Commissions.
                  </h2>
                </div>

                {/* Description and button */}
                <div className="space-y-8">
                  <div className="space-y-3">
                    <p className="text-base text-[var(--dark-1)] leading-[1.25]">
                      Earn income by sharing a product - you can get started
                      now.
                    </p>
                    <p className="text-base text-[var(--dark-1)] leading-[1.25]">
                      Earn 10% commission on every referral for 180 days.
                    </p>
                  </div>

                  {/* Apply New Button */}
                  <div className="flex justify-center lg:justify-start pb-[133px]">
                    <LinkWithAuthority
                      href={AFFILIATE_PORTAL_URL}
                      className="inline-block bg-[var(--brand-0)] text-[var(--dark-1)] px-4 py-2 rounded font-mono text-base leading-[1.5] hover:bg-[var(--brand-2)] transition-colors"
                    >
                      Apply New
                    </LinkWithAuthority>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
