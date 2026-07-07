"use client";

import Image from "next/image";
import Link from "next/link";
import SectionEyebrow from "@/app/sandbox1/components/SectionEyebrow";
import { useI18nSubscription } from "@/i18n/provider";
import { __t } from "@/i18n/runtime";

interface Testimonial {
  text: string;
  author: string;
  title: string;
  brandLogoSrc: string;
  brandLogoAlt: string;
  avatarSrc?: string;
  brandLogoClassName?: string;
  caseStudy?: { href: string; label: string; id: string };
}

// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load
// time (stale Chinese after switching back to en, which never downloads a
// catalog and relies on the baked-in fallback).
function getTestimonials(): Testimonial[] {
  return [
    {
      brandLogoSrc: "/logo/hugging_face.svg",
      brandLogoAlt: "Hugging Face",
      avatarSrc: "/home/testimonial/huggingface.jpeg",
      text: "I appreciate how fast Novita AI moves to deploy newly released models. Their team is often the first to get stable, production ready inference support online – often on Day One. That speed is critical for the whole open-source AI community.",
      author: "Julien Chaumond",
      title: "Co-Founder & CTO",
    },
    {
      brandLogoSrc: "/homepage/testimonials/2.png",
      brandLogoAlt: "Fish Audio",
      avatarSrc: "/home/testimonial/FishAudio.jpeg",
      text: "Novita has been a huge help for us at Fish Audio. Their reliable GPU infrastructure allows us focus on developing and improving our text-to-speech models instead of dealing with hardware headaches. Their support and performance have made it much easier to push our work forward.",
      author: "Shijia Liao",
      title: "Co-Founder & Chief Scientist",
    },
    {
      brandLogoSrc: "/homepage/testimonials/3.png",
      brandLogoAlt: "Partner",
      avatarSrc: "/home/testimonial/Gizmo.jpeg",
      text: "Novita's Model API was super simple to integrate, and it's been great in powering our AI-driven flashcards and quizzes. The platform takes care of the heavy lifting, so we can focus on building better learning tools for our users without worrying about infrastructure or scaling issues.",
      author: "Petros Christodoulou",
      title: "Co-Founder and CEO",
    },
    {
      brandLogoSrc: "/homepage/testimonials/kilo-logo.png",
      brandLogoAlt: "Kilo Code",
      avatarSrc: "/home/testimonial/kilo-avatar.png",
      text: "Working with Novita AI has been a fantastic experience for Kilo. Their inference platform helps us deliver fast and reliable AI coding workflows across multiple LLMs, with strong real-world performance for agentic workflows. And the team has been remarkably easy to work with! They are always optimizing based on the latest models and technology—a perfect partner for Kilo Code.",
      author: "Ari Messer",
      title: "Head of Partnerships",
    },
  ];
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-light)] border border-[var(--border-default)]">
      <div className="flex flex-1 flex-col gap-[20px] p-[32px]">
        <div className="flex min-h-[43px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center">
            <Image
              src={testimonial.brandLogoSrc}
              alt={testimonial.brandLogoAlt}
              width={148}
              height={43}
              className={`h-[43px] w-auto max-w-[148px] object-contain object-left ${testimonial.brandLogoClassName ?? ""}`}
            />
          </div>
          {testimonial.caseStudy ? (
            <Link
              href={testimonial.caseStudy.href}
              target="_blank"
              rel="noopener noreferrer"
              id={testimonial.caseStudy.id}
              className="shrink-0 font-paragraph-14 text-[var(--brand-0)] underline-offset-2 hover:text-[var(--brand-1)] hover:underline"
            >
              {testimonial.caseStudy.label}
            </Link>
          ) : null}
        </div>
        <p className="font-paragraph-18 text-[var(--text-2)]">
          <span aria-hidden="true">{'"'}</span>
          {testimonial.text}
          <span aria-hidden="true">{'"'}</span>
        </p>
      </div>
      {/* Footer — Figma 1:12654: 64px 头像 + gap 20 + Paragraph/14；高度随内容，无固定 min-height */}
      <div className="flex items-center gap-[20px] border-t border-[var(--border-default)]">
        <div className="relative size-[64px] shrink-0 overflow-hidden bg-[var(--fill-3)]">
          {testimonial.avatarSrc ? (
            <Image
              src={testimonial.avatarSrc}
              alt={testimonial.author}
              width={64}
              height={64}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--fill-3)]" aria-hidden />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0">
          <p className="w-full font-paragraph-14-medium text-[var(--text-1)]">
            {testimonial.author}
          </p>
          <p className="w-full font-paragraph-14 text-[var(--text-3)]">
            {testimonial.title}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  useI18nSubscription();
  const testimonials = getTestimonials();

  return (
    <section className="relative overflow-hidden py-[80px]">
      <Image
        src="/home/testimonial/testimonila-bg.png"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none absolute inset-0 object-cover object-center"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-8 lg:px-[48px]">
        <SectionEyebrow
          label={__t(
            "src/app/homepage/components/Testimonials.testimonials",
            "Testimonials",
          )}
        />

        <h2 className="mt-[48px] text-[32px] leading-[1.2] text-[var(--text-1)] font-normal">
          {__t(
            "src/app/homepage/components/Testimonials.dontTakeOurWordForIt",
            "Don't take our word for it.",
          )}
        </h2>

        <div className="mt-[48px] grid grid-cols-1 gap-[16px] items-stretch md:grid-cols-2 lg:grid-cols-3">
          <TestimonialCard testimonial={testimonials[0]} />
          <div className="hidden lg:block" aria-hidden />
          <TestimonialCard testimonial={testimonials[1]} />
          <div className="hidden lg:block" aria-hidden />
          <TestimonialCard testimonial={testimonials[2]} />
          <TestimonialCard testimonial={testimonials[3]} />
        </div>
      </div>
    </section>
  );
}
