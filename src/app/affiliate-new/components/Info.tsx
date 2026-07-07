import Image from "next/image";
import LinkWithAuthority from "@/app/components/LinkWithAuthority";
import { AFFILIATE_PORTAL_URL } from "@/constants/urls";

// Icon mapping for "Who can apply" cards
const applyConditionIcon = [
  "/affiliate-new/user-code-alt.svg", // Card 1: Developers and Tech Enthusiasts
  "/affiliate-new/briefcase.svg", // Card 2: Entrepreneurs and Founders
  "/affiliate-new/lightbulb-sparkles.svg", // Card 3: AI Influencers and Content Creators
  "/affiliate-new/pen-ai.svg", // Card 4: Bloggers and Writers
  "/affiliate-new/book-open-countdown.svg", // Card 5: Educators and Researchers
  "/affiliate-new/globe-sparkles.svg", // Card 6: Media Platforms and Communities
];

export function Info() {
  return (
    <section>
      {/* Why Join the Affiliate Program section */}
      <div className="max_width_container">
        <div className="mx-web">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-semibold text-[var(--dark-1)] mb-12 leading-tight tracking-[-2%]">
              Why Join the Affiliate Program
            </h2>
          </div>

          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="bg-[#F5F5F5] backdrop-blur-[50px] p-7 min-h-[226px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-[var(--brand-0)]"></div>
                    <span className="text-xl font-mono text-[var(--brand-1)] tracking-[2%] uppercase">
                      01
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-mono text-[var(--dark-1)] tracking-[2%]">
                    Unique AI Cloud Platform
                  </h3>
                  <p className="text-sm font-mono text-[var(--dark-1)] leading-[1.14] tracking-[2%]">
                    Show off an all-in-one AI cloud solution with 200+
                    open-source model APIs (like chat, code, image, audio,
                    video), serverless GPUs, and on-demand GPU instances that
                    are super reliable.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#F5F5F5] backdrop-blur-[50px] p-7 min-h-[226px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-[var(--brand-0)]"></div>
                    <span className="text-xl font-mono text-[var(--brand-1)] tracking-[2%] uppercase">
                      02
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-mono text-[var(--dark-1)] tracking-[2%]">
                    High conversion rate
                  </h3>
                  <p className="text-base text-[var(--dark-1)] leading-[1.14] tracking-[2%]">
                    Our trusted brand and effective promo material ensure the
                    traffic you send to Novita will convert!
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 3 */}
              <div className="bg-[#F5F5F5] backdrop-blur-[50px] p-7 min-h-[226px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-[var(--brand-0)]"></div>
                    <span className="text-xl font-mono text-[var(--brand-1)] tracking-[2%] uppercase">
                      03
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-mono text-[var(--dark-1)] tracking-[2%]">
                    Exclusive Access
                  </h3>
                  <p className="text-sm font-mono text-[var(--dark-1)] leading-[1.14] tracking-[2%]">
                    Early Beta Access. Get a head start with early access to the
                    latest AI models and features.
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#F5F5F5] backdrop-blur-[50px] p-7 min-h-[226px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-[var(--brand-0)]"></div>
                    <span className="text-xl font-mono text-[var(--brand-1)] tracking-[2%] uppercase">
                      04
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-mono text-[var(--dark-1)] tracking-[2%]">
                    Dedicated Support
                  </h3>
                  <p className="text-sm font-mono text-[var(--dark-1)] leading-[1.14] tracking-[2%]">
                    Priority support and resources to maximize your earning
                    potential.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Apply Now Button */}
          <div className="text-center mt-8">
            <LinkWithAuthority
              href={AFFILIATE_PORTAL_URL}
              className="inline-block bg-[var(--brand-0)] text-[var(--dark-1)] px-4 py-2 rounded font-mono text-base leading-[1.5] hover:bg-[var(--brand-2)] transition-colors mb-20"
            >
              Apply Now
            </LinkWithAuthority>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-[#F5F5F5] py-20 -mx-[calc(var(--spacing-layout-x))] px-[calc(var(--spacing-layout-x))]">
        <div className="max_width_container">
          <div className="mx-web">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-semibold text-[var(--dark-1)] mb-12 leading-tight tracking-[-2%]">
                How it works
              </h2>
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-[1040px] w-full">
                {/* Step 1 */}
                <div className="bg-white p-7 min-h-[286px] flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-0 h-0 border-l-[12px] border-l-[var(--brand-0)] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                    <span className="text-xl font-mono text-[var(--brand-1)] tracking-[2%] uppercase">
                      01
                    </span>
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-xl font-mono text-[var(--dark-1)] tracking-[2%]">
                      Join the program
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-mono text-[var(--dark-1)] leading-[1.14] tracking-[2%]">
                          Sign up and apply to become a Novita affiliate, and
                          get your exclusive affiliate link.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-7 min-h-[286px] flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-0 h-0 border-l-[12px] border-l-[var(--brand-0)] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                    <span className="text-xl font-mono text-[var(--brand-1)] tracking-[2%] uppercase">
                      02
                    </span>
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-xl font-mono text-[var(--dark-1)] tracking-[2%]">
                      Promote Novita to your audience
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[var(--dark-1)] rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-sm font-mono text-[var(--dark-1)] leading-[1.14] tracking-[2%]">
                          Share Novita using your affiliate link through your
                          channels.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-[var(--dark-1)] rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-sm font-mono text-[var(--dark-1)] leading-[1.14] tracking-[2%]">
                          Help your audiences unlock the capabilities of AI APIs
                          and serverless GPUs with ease.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-7 min-h-[286px] flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-0 h-0 border-l-[12px] border-l-[var(--brand-0)] border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
                    <span className="text-xl font-mono text-[var(--brand-1)] tracking-[2%] uppercase">
                      03
                    </span>
                  </div>
                  <div className="space-y-4 flex-1">
                    <h3 className="text-xl font-mono text-[var(--dark-1)] tracking-[2%]">
                      Earn rewards
                    </h3>
                    <p className="text-sm font-mono text-[var(--dark-1)] leading-[1.14] tracking-[2%]">
                      Earn a 10% commission on each spending made by customers
                      you refer for 180 days, with no limit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Now Button */}
            <div className="text-center mt-8">
              <LinkWithAuthority
                href={AFFILIATE_PORTAL_URL}
                className="inline-block bg-[var(--brand-0)] text-[var(--dark-1)] px-4 py-2 rounded font-mono text-base leading-[1.5] hover:bg-[var(--brand-2)] transition-colors"
              >
                Apply Now
              </LinkWithAuthority>
            </div>
          </div>
        </div>
      </div>

      {/* Who can apply section */}
      <div className="bg-white py-20">
        <div className="max_width_container">
          <div className="mx-web">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-semibold text-[var(--dark-1)] mb-12 leading-tight tracking-[-2%]">
                Who can apply
              </h2>
              <p className="text-base text-[#4F4E4A] max-w-[900px] mx-auto leading-[1.5]">
                You have an audience that trusts you, and your audience already
                comes to you to learn about the coolest new AI Models and the
                most cost-effective GPU. Your audience can focus on innovation,
                not infrastructure.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-[1042px]">
                {/* Row 1 - 3 cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Card 1 */}
                  <div className="bg-white border border-[#CBC9C4] p-6 min-h-[204px] flex flex-col items-center text-center">
                    <div className="w-8 h-8  rounded mb-2 flex items-center justify-center">
                      <Image
                        src={applyConditionIcon[0]}
                        alt="Developers icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--dark-1)] mb-2 leading-[1.33]">
                      Developers and Tech Enthusiasts
                    </h3>
                    <p className="text-sm text-[var(--dark-1)] leading-[1.43] max-w-[316px]">
                      Share Novita&apos;s fast, affordable AI Cloud with fellow
                      builders and help accelerate their projects.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-[#CBC9C4] p-6 min-h-[204px] flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded mb-2 flex items-center justify-center">
                      <Image
                        src={applyConditionIcon[1]}
                        alt="Entrepreneurs icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--dark-1)] mb-2 leading-[1.33]">
                      Entrepreneurs and Founders
                    </h3>
                    <p className="text-sm text-[var(--dark-1)] leading-[1.43] max-w-[316px]">
                      Introduce Novita to your networks and empower others to
                      build smart with AI.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-[#CBC9C4] p-6 min-h-[204px] flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded mb-2 flex items-center justify-center">
                      <Image
                        src={applyConditionIcon[2]}
                        alt="AI Influencers icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--dark-1)] mb-2 leading-[1.33]">
                      AI Influencers and Content Creators
                    </h3>
                    <p className="text-sm text-[var(--dark-1)] leading-[1.43] max-w-[316px]">
                      Showcase how Novita fits into your workflows through
                      tutorials or reviews and earn by sharing tools your
                      audience can trust.
                    </p>
                  </div>
                </div>

                {/* Row 2 - 3 cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Card 4 */}
                  <div className="bg-white border border-[#CBC9C4] p-6 min-h-[204px] flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded mb-2 flex items-center justify-center">
                      <Image
                        src={applyConditionIcon[3]}
                        alt="Bloggers icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--dark-1)] mb-2 leading-[1.33]">
                      Bloggers and Writers
                    </h3>
                    <p className="text-sm text-[var(--dark-1)] leading-[1.43] max-w-[316px]">
                      Incorporate Novita into your content and help your readers
                      discover accessible AI solutions.
                    </p>
                  </div>

                  {/* Card 5 */}
                  <div className="bg-white border border-[#CBC9C4] p-6 min-h-[204px] flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded mb-2 flex items-center justify-center">
                      <Image
                        src={applyConditionIcon[4]}
                        alt="Educators icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--dark-1)] mb-2 leading-[1.33]">
                      Educators and Researchers
                    </h3>
                    <p className="text-sm text-[var(--dark-1)] leading-[1.43] max-w-[316px]">
                      Share Novita with your students and peers to bring the
                      future of AI Cloud to them, providing access to 200+
                      powerful AI models for their learning, research, and
                      experimentation!
                    </p>
                  </div>

                  {/* Card 6 */}
                  <div className="bg-white border border-[#CBC9C4] p-6 min-h-[204px] flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded mb-2 flex items-center justify-center">
                      <Image
                        src={applyConditionIcon[5]}
                        alt="Media Platforms icon"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--dark-1)] mb-2 leading-[1.33]">
                      Media Platforms and Communities
                    </h3>
                    <p className="text-sm text-[var(--dark-1)] leading-[1.43] max-w-[316px]">
                      Monetize your reach by connecting your audience with
                      cutting-edge AI infrastructure.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Now Button */}
            <div className="text-center mt-8">
              <LinkWithAuthority
                href={AFFILIATE_PORTAL_URL}
                className="inline-block bg-[var(--brand-0)] text-[var(--dark-1)] px-4 py-2 rounded font-mono text-base leading-[1.5] hover:bg-[var(--brand-2)] transition-colors"
              >
                Apply Now
              </LinkWithAuthority>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
