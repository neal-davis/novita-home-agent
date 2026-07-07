"use client";

import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import Button from "@/app/components/button/Button";
import { LayoutSafeRail } from "@/app/components/layout/LayoutSafeRail";
import { NOVITA_URL, BREVO_BOOK_LINK, DOCS_SKILL_URL } from "@/constants/urls";
import HeroBackground from "./HeroBackground";
import HeroDecoration from "./HeroDecoration";
import { useAppSelector } from "@/store";
import { useI18nSubscription } from "@/i18n/provider";

const HOME_HERO_PT = "clamp(5rem, calc(3.5rem + 6svh), 8.75rem)";
const HOME_HERO_PT_SAFE = `calc(env(safe-area-inset-top, 0px) + ${HOME_HERO_PT})`;
const AGENT_COPY_TEXT = `Read ${DOCS_SKILL_URL} and follow the instructions.`;

export default function Hero() {
  useI18nSubscription();

  const { token, uuid } = useAppSelector((state) => state.user);
  const [agentCopied, setAgentCopied] = useState(false);
  const agentCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startBuildingLink =
    token || uuid ? NOVITA_URL.CONSOLE : NOVITA_URL.USER_REGISTER;
  const AgentCopyIcon = agentCopied ? Check : Copy;

  useEffect(() => {
    return () => {
      if (agentCopyTimerRef.current) {
        clearTimeout(agentCopyTimerRef.current);
      }
    };
  }, []);

  const handleAgentCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    await navigator.clipboard.writeText(AGENT_COPY_TEXT);
    setAgentCopied(true);

    if (agentCopyTimerRef.current) {
      clearTimeout(agentCopyTimerRef.current);
    }
    agentCopyTimerRef.current = setTimeout(() => {
      setAgentCopied(false);
    }, 1600);
  };

  return (
    <section className="relative flex w-full flex-col overflow-hidden min-h-[802px] md:min-h-[1117px] lg:min-h-[983px] bg-[var(--gray-50)]">
      <HeroBackground />

      {/* Decorative triangle + anchor labels */}
      <HeroDecoration />

      <LayoutSafeRail
        className="relative z-10 flex flex-1 flex-col items-start justify-center"
        style={{
          paddingTop: HOME_HERO_PT_SAFE,
          paddingBottom: "max(0px, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex w-full min-w-0 max-w-[min(22.75rem,100%)] flex-col items-start gap-[48px] text-left md:max-w-[min(35rem,100%)] lg:max-w-[560px]">
          {/* Figma: buttons bottom-of-Content (24px padding) + Content-to-card gap (24px) = 48px */}
          <div className="flex w-full flex-col items-start gap-[48px]">
            <div className="flex w-full flex-col items-start gap-[48px]">
              <div className="flex w-full max-w-[364px] flex-col items-start gap-6 md:max-w-[560px] lg:max-w-none">
                <h1
                  className="
                    font-miletus font-heading-h3 text-[var(--text-1)]
                    md:text-[52px] md:leading-[58px] md:tracking-[-1.56px] md:font-medium
                    lg:font-display-md
                  "
                >
                  The AI-Native Cloud
                  <br aria-hidden="true" />
                  for Builders and
                  <br aria-hidden="true" />
                  Agents
                </h1>
                <p
                  className="
                    w-full max-w-[348px] font-miletus font-paragraph-18 text-[var(--text-3)] md:max-w-[400px] md:font-paragraph-20
                    lg:max-w-[400px] lg:font-paragraph-18
                  "
                >
                  Run models, scale GPUs, and build AI agents, all on one
                  platform.
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center justify-start gap-3">
                <Button
                  type="primary"
                  height={40}
                  renderTag="link"
                  link={startBuildingLink}
                  className="min-w-[120px] px-[18px] whitespace-nowrap"
                >
                  Start Building
                </Button>
                <div className="group relative z-30 shrink-0">
                  <button
                    type="button"
                    onClick={handleAgentCopy}
                    className="inline-flex h-[40px] min-w-[126px] items-center justify-center gap-space-8 rounded-[var(--radius-full)] border border-[var(--border-strong)] bg-[var(--white)] px-[18px] font-miletus font-paragraph-15 text-[var(--text-1)] transition-colors hover:bg-[var(--gray-50)] focus:outline-none"
                    aria-describedby="home-agent-instructions"
                    aria-label={
                      agentCopied
                        ? "Copied agent instructions"
                        : "Copy agent instructions"
                    }
                  >
                    <span className="whitespace-nowrap">For Agent</span>
                    <AgentCopyIcon
                      size={16}
                      strokeWidth={1.5}
                      className="size-4 shrink-0 text-current"
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    id="home-agent-instructions"
                    className="invisible absolute left-0 top-full w-[min(410px,calc(100vw-var(--spacing-layout-x)*2))] pt-space-16 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 md:left-1/2 md:-translate-x-1/2 md:group-hover:-translate-x-1/2"
                  >
                    <div className="relative rounded-8 border border-[var(--border-subtle)] bg-[var(--white)] px-[14px] py-space-24 text-left shadow-[0_12px_28px_var(--alpha-dark-10)]">
                      <div
                        aria-hidden="true"
                        className="absolute -top-[7px] left-[50px] size-[14px] rotate-45 border-l border-t border-[var(--border-subtle)] bg-[var(--white)] md:left-1/2 md:-ml-[7px]"
                      />
                      <p className="font-miletus font-paragraph-13 text-[var(--text-3)]">
                        Click to copy instructions for you agent:
                      </p>
                      <div className="mt-space-8 flex min-w-0 items-center gap-space-8 rounded-6 border border-[var(--alpha-light-80)] bg-[var(--alpha-dark-3)] p-space-8">
                        <span className="min-w-0 flex-1 select-text overflow-x-auto whitespace-nowrap font-miletus font-paragraph-13 text-[var(--text-2)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          Read{" "}
                          <Link
                            href={DOCS_SKILL_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--text-2)] underline decoration-solid underline-offset-2 hover:text-[var(--text-1)]"
                          >
                            {DOCS_SKILL_URL}
                          </Link>{" "}
                          and follow the instructions.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  type="text"
                  height={40}
                  renderTag="link"
                  link={BREVO_BOOK_LINK}
                  className="min-w-[120px] px-[18px] whitespace-nowrap"
                  elAttrs={{ target: "_blank", rel: "noopener noreferrer" }}
                >
                  Talk to Us
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none h-[268px] w-full max-w-[430px]"
            />
          </div>
        </div>
      </LayoutSafeRail>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[52px] md:h-[84px] lg:h-[100px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(250, 250, 250, 0) 0%, rgba(250, 250, 250, 0.64) 58%, #f6f7f4 100%)",
        }}
      />
    </section>
  );
}
