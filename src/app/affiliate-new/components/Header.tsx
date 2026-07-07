import { Button } from "@/components/ui/button";
import LinkWithAuthority from "@/app/components/LinkWithAuthority";
import Partners from "@/app/mainpage/components/Partners";
import Image from "next/image";

const partners = [
  {
    id: "be-bee",
    src: "/mainpage/partners/be-bee.png",
    alt: "beBee",
    width: 97,
    height: 27,
    link: "https://www.bebee.com",
  },
  {
    id: "wiz-ai",
    src: "/mainpage/partners/wiz-ai.png",
    alt: "Wiz AI",
    width: 97,
    height: 27,
    link: "https://www.wiz.ai",
  },
  {
    id: "gizmo-ai",
    src: "/mainpage/partners/gizmo-ai.png",
    alt: "Gizmo AI",
    width: 97,
    height: 27,
    link: "https://gizmo.ai",
  },
  {
    id: "hygo",
    src: "/mainpage/partners/hygo.png",
    alt: "Hygo",
    width: 97,
    height: 27,
    link: "https://www.hygo.com",
  },
  {
    id: "tidb",
    src: "/mainpage/partners/tidb.png",
    alt: "TiDB",
    width: 97,
    height: 27,
    link: "https://cn.pingcap.com",
  },
  {
    id: "fish-audio",
    src: "/mainpage/partners/fish-audio.png",
    alt: "Fish Audio",
    width: 97,
    height: 27,
    link: "https://fish.audio",
  },
  {
    id: "monica",
    src: "/mainpage/partners/monica.png",
    alt: "Monica",
    width: 97,
    height: 27,
    link: "https://monica.im/en",
  },
  {
    id: "wavespeed",
    src: "/mainpage/partners/wavespeed.svg",
    alt: "Wavespeed",
    width: 173,
    height: 27,
    link: "https://www.wavespeed.ai",
  },
  {
    id: "anything-llm",
    src: "/mainpage/partners/llm.png",
    alt: "anythingLLM",
    width: 97,
    height: 27,
    link: "https://anythingllm.com",
  },
  {
    id: "hugging-face",
    src: "/mainpage/partners/huggingface.png",
    alt: "Hugging Face",
    width: 97,
    height: 27,
    link: "https://huggingface.co",
  },
  {
    id: "sgl",
    src: "/mainpage/partners/sgl.png",
    alt: "SGLang",
    width: 97,
    height: 27,
    link: "https://sglang.ai",
  },
];

export function Header({
  affiliatePortalUrl,
  isLoggedIn,
  isTeamNonOwner,
  loginUrl,
  onLoginStart,
}: {
  affiliatePortalUrl: string;
  isLoggedIn: boolean;
  isTeamNonOwner: boolean;
  loginUrl: string;
  onLoginStart: () => void;
}) {
  const primaryCtaHref = isTeamNonOwner
    ? "#affiliate-team-owner-required"
    : isLoggedIn
      ? "#affiliate-credentials"
      : affiliatePortalUrl;

  return (
    <header className="py-20">
      <div className="max_width_container">
        <div className="mx-web mt-[94px]">
          {/* Main content area with left content and right image */}
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-12 mb-20">
            {/* Left content area - will shrink when browser window gets smaller */}
            <div className="flex-1 max-w-[592px] space-y-8">
              {/* Main heading */}
              <h1 className="text-5xl lg:text-[80px] font-semibold text-[var(--dark-1)] leading-[0.925] tracking-[-2%]">
                Join Novita&apos;s Affiliate program
              </h1>

              {/* Description */}
              <div className="max-w-[593px] space-y-2 text-xl leading-[1.2] text-[var(--dark-2)]">
                <div className="flex items-start gap-3">
                  <div className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--dark-2)]"></div>
                  <p>
                    Share the future of AI cloud and start earning commissions
                    today.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--dark-2)]"></div>
                  <p>
                    Earn 10% commission on every referral&apos;s spending for
                    the first 180 days.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--dark-2)]"></div>
                  <p>
                    Turn your content into revenue, and free people from AI
                    infrastructure - it&apos;s win-win
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col items-start gap-5">
                <Button
                  size="lg"
                  asChild
                  className="h-10 bg-[var(--brand-0)] px-4 py-3 font-mono text-base leading-[1.5] text-[var(--dark-1)] hover:bg-[var(--brand-1)]"
                >
                  <LinkWithAuthority href={primaryCtaHref}>
                    {isTeamNonOwner
                      ? "Team Owner Required"
                      : isLoggedIn
                        ? "Affiliate Login"
                        : "Become an Affiliate"}
                  </LinkWithAuthority>
                </Button>
                <p className="max-w-[420px] text-sm leading-[1.5] text-[var(--dark-3-1)]">
                  {isTeamNonOwner
                    ? "Switch to the Team Owner account to access affiliate credentials."
                    : isLoggedIn
                      ? "Your affiliate credentials are ready below"
                      : "New to Novita? Sign up directly through our affiliate portal."}
                </p>
              </div>

              {!isLoggedIn && (
                <div className="rounded-lg border border-[var(--border-default)] bg-white/80 p-6 shadow-[0_12px_40px_var(--alpha-dark-10)] backdrop-blur">
                  <h2 className="mb-2 text-2xl font-semibold text-[var(--dark-1)]">
                    Already have a Novita account?
                  </h2>
                  <p className="mb-5 text-base leading-[1.5] text-[var(--dark-2)]">
                    Log in to instantly access your affiliate credentials. Your
                    account was automatically enrolled!
                  </p>
                  <Button
                    size="lg"
                    asChild
                    className="h-10 bg-[var(--dark-1)] px-4 py-3 font-mono text-base leading-[1.5] text-white hover:bg-[var(--dark-2)]"
                  >
                    <a href={loginUrl} onClick={onLoginStart}>
                      Get Started
                    </a>
                  </Button>
                </div>
              )}

              {isLoggedIn && isTeamNonOwner && (
                <div
                  id="affiliate-team-owner-required"
                  className="rounded-lg border border-[var(--border-default)] bg-[var(--gray-3)] p-5"
                >
                  <h2 className="mb-2 text-xl font-semibold text-[var(--dark-1)]">
                    Team Owner required
                  </h2>
                  <p className="text-sm leading-[1.5] text-[var(--dark-2)]">
                    You&apos;re currently using a team account. Please switch to
                    the Team Owner account to access affiliate credentials.
                  </p>
                </div>
              )}
            </div>

            {/* Right image area - fixed size, won't shrink */}
            <div className="flex w-full flex-shrink-0 items-center justify-center xl:w-[400px] xl:justify-end">
              <Image
                src="/affiliate-new/header-bg.svg"
                alt="Affiliate Program Header Background"
                width={500}
                height={400}
                className="w-full max-w-[400px] h-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* TRUSTED BY section - using homepage Partners component */}
        {/* Move Partners outside of the flex container to get full width */}
        <div className="mx-web">
          <Partners
            needTag={true}
            customPartners={partners}
            containerClassName="!w-full sm:!w-full md:!w-full lg:!w-full xl:!w-full 2xl:!w-full [&>div]:!max-w-full [&>div]:md:!max-w-full"
          />
        </div>
      </div>
    </header>
  );
}
