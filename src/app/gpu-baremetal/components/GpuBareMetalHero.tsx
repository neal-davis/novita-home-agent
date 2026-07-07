import Image from "next/image";
import Button from "@/app/components/button/Button";
import { BREVO_BOOK_LINK } from "@/constants/urls";

export default function GpuBareMetalHero() {
  return (
    <section className="relative w-full min-h-[480px] md:min-h-[600px] lg:min-h-[700px] bg-[var(--gray-50)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <Image
          src="/gpus/v5/gpu-bare-metal-hero-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center lg:object-right-top"
          priority
          aria-hidden
        />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 md:h-40 lg:h-[208px] pointer-events-none"
        aria-hidden
        style={{
          background: "linear-gradient(to bottom, transparent, var(--gray-50))",
        }}
      />

      <div className="relative z-10 flex min-h-[480px] md:min-h-[600px] lg:min-h-[700px] flex-col justify-start">
        <div className="w-full max-w-[1512px] mx-auto px-[var(--spacing-layout-x)] pt-[120px] md:pt-[215px] lg:pt-[215px]">
          <div className="max-w-[560px]">
            <div className="flex flex-col gap-[var(--space-24)]">
              <div className="flex items-center gap-[var(--space-8)]">
                <span
                  className="h-2 w-2 rounded-[2px] bg-[var(--brand-0)]"
                  aria-hidden
                />
                <span className="font-mono-13 uppercase text-[var(--dark-2)]">
                  GPU BARE METAL
                </span>
              </div>

              <div className="flex flex-col gap-[var(--space-16)]">
                <h1 className="font-miletus font-display-md text-[var(--text-1)]">
                  Rent Bare Metal GPU Servers
                </h1>
                <p className="font-miletus font-paragraph-18 text-[var(--text-3)] max-w-[400px]">
                  High-performance bare metal GPU servers. Full control and low
                  cost—ideal for AI, ML, and deep learning workloads.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-[var(--space-12)]">
                <Button
                  type="primary"
                  height={44}
                  width={115}
                  renderTag="link"
                  link={BREVO_BOOK_LINK}
                  elAttrs={{
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
