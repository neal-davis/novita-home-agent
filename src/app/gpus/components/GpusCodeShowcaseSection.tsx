"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CODE_OBJ, fileExtra, LANGUAGE_MAP } from "./Code/cfg";
import { ServerCodeAnimation } from "./Code/outputCode";

const TOKEN_CLASS_MAP: Record<string, string> = {
  purple: "text-[#c678dd]",
  blue: "text-[#61afef]",
  green: "text-[#98c379]",
  yellow: "text-[#e5c07b]",
  red: "text-[#e06c75]",
  white: "text-[var(--white)]",
  blueGreen: "text-[#56b6c2]",
  weightGreen: "font-semibold text-[#98c379]",
  brightYellow: "font-semibold text-[#e5c07b]",
};

const LIGHT_TOKEN_CLASS_MAP: Record<string, string> = {
  purple: "text-[#c678dd]",
  blue: "text-[#407ee7]",
  green: "text-[#6d9b45]",
  yellow: "text-[#e88d47]",
  red: "text-[#e0545c]",
  white: "text-[var(--text-1)]",
  blueGreen: "text-[#407ee7]",
  weightGreen: "font-semibold text-[#6d9b45]",
  brightYellow: "font-semibold text-[#e88d47]",
};

const LANG_ICON_SRC: Record<string, string> = {
  python: "/gpu-instance/home/python.svg",
  ruby: "/gpu-instance/home/ruby.svg",
  php: "/gpu-instance/home/php.svg",
  java: "/gpu-instance/home/java.svg",
  node: "/gpu-instance/home/node.svg",
  go: "/gpu-instance/home/go.svg",
};

export default function GpusCodeShowcaseSection() {
  const [activeLanguage, setActiveLanguage] = useState(
    LANGUAGE_MAP[0].iconName,
  );
  const [showResponse, setShowResponse] = useState(false);

  const fileName = `instance.${fileExtra[activeLanguage]}`;
  const activeLanguageLabel = useMemo(() => {
    const hit = LANGUAGE_MAP.find((lang) => lang.iconName === activeLanguage);
    return (hit?.text || activeLanguage).toUpperCase();
  }, [activeLanguage]);

  const responseLines = useMemo(
    () =>
      [
        "{",
        '"instances": [{',
        "}]",
        '"id": "12948885700ef8e3",',
        '"memory": "63",',
        '"gpuNum":"1",',
        '"productId": "1",',
        '"productName": "RTX 4090 24GB",',
        '"instancePrice": "269100",',
        '"total": "1",',
        "}",
      ] as const,
    [],
  );

  return (
    <section className="mt-space-48 pt-space-80">
      <div className="border-b border-[var(--border-strong)] pb-[var(--space-8)]">
        <div className="flex items-center gap-[var(--space-8)]">
          <span className="h-[8px] w-[8px] rounded-[2px] bg-[var(--brand-0)]" />
          <span className="font-mono-14 uppercase text-[var(--text-2)]">
            GPU Pricing
          </span>
        </div>
      </div>

      <div className="py-space-24">
        <div className="flex flex-col gap-space-16">
          <h2 className="font-miletus text-[28px] font-normal leading-[38px] tracking-[-0.56px] text-[var(--text-1)]">
            Develop with Our Simple APIs
          </h2>
          <p className="max-w-[430px] font-paragraph-18 text-[var(--text-3)]">
            Manage your workflows with ease using our comprehensive APIs.
            Quickly launch, terminate, or restart instances directly from your
            code.
          </p>
        </div>
      </div>

      <div className="mt-space-48 flex flex-col gap-space-24 md:flex-row md:gap-space-48">
        {/* Side menu: stacked above code on small screens, left column on md+ */}
        <div className="w-full shrink-0 py-space-16 md:sticky md:top-0 md:w-[clamp(120px,_10vw+72px,_180px)] md:py-space-40">
          <div
            className={cn(
              "flex flex-nowrap overflow-x-auto overflow-y-hidden border-b border-[var(--border-default)]",
              "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "touch-pan-x md:flex-col md:overflow-visible md:border-b-0",
            )}
          >
            {LANGUAGE_MAP.map((item) => {
              const isActive = item.iconName === activeLanguage;
              return (
                <button
                  key={item.iconName}
                  aria-pressed={isActive}
                  aria-label={item.text}
                  className={cn(
                    "relative flex shrink-0 items-center gap-space-12 text-left",
                    "-mb-px flex-row whitespace-nowrap border-b-2 px-space-16 py-space-12 first:pl-0",
                    isActive ? "border-[var(--brand-0)]" : "border-transparent",
                    "md:mb-0 md:w-full md:flex-col md:items-start md:gap-space-12 md:border-0 md:border-b md:border-[var(--border-default)] md:px-0 md:py-space-16 md:whitespace-normal",
                  )}
                  onClick={() => {
                    setActiveLanguage(item.iconName);
                    setShowResponse(false);
                  }}
                  type="button"
                >
                  <div className="flex items-center gap-space-12">
                    <img
                      alt=""
                      className="h-[24px] w-[24px]"
                      src={LANG_ICON_SRC[item.iconName]}
                    />
                    <span className="font-mono-14 uppercase text-[var(--text-2)]">
                      {item.text}
                    </span>
                  </div>
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-0 right-0 hidden h-[2px] bg-[var(--brand-0)] md:block" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main panels */}
        <div className="flex min-w-0 flex-1 flex-col gap-space-24">
          <div className="pt-0 md:pt-space-40">
            <div className="border-b border-[var(--border-strong)] pb-[var(--space-8)]">
              <div className="flex items-center gap-[var(--space-8)]">
                <span className="h-[8px] w-[8px] rounded-[2px] bg-[var(--brand-0)]" />
                <span className="font-mono-14 uppercase text-[var(--text-2)]">
                  {activeLanguageLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-space-24 lg:grid-cols-2">
            {/* Request code (light) */}
            <div className="overflow-hidden rounded-[4px] border border-[var(--border-default)] bg-white">
              <div className="flex h-[40px] items-center gap-space-12 border-b border-[var(--border-default)] px-space-24">
                <div className="flex items-center gap-[6px]">
                  <span className="h-[8px] w-[8px] rounded-full bg-[rgba(255,100,103,0.8)]" />
                  <span className="h-[8px] w-[8px] rounded-full bg-[rgba(255,185,0,0.8)]" />
                  <span className="h-[8px] w-[8px] rounded-full bg-[rgba(0,212,146,0.8)]" />
                </div>
                <span className="font-miletus text-[14px] font-medium leading-[20px] text-[var(--text-1)]">
                  {fileName}
                </span>
              </div>

              <div className="h-[266px]">
                <ServerCodeAnimation
                  codeContent={CODE_OBJ[activeLanguage]}
                  codeType={activeLanguage}
                  updateOutputStatus={() => setShowResponse(true)}
                />
              </div>
            </div>

            {/* Response (dark) */}
            <div className="overflow-hidden rounded-[4px] bg-[rgba(10,10,10,0.9)]">
              <div className="flex h-[40px] items-center justify-between bg-[rgba(10,10,10,0.8)] px-space-24">
                <div className="flex items-center gap-space-12">
                  <div className="flex items-center gap-[6px]">
                    <span className="h-[8px] w-[8px] rounded-full bg-[rgba(255,100,103,0.8)]" />
                    <span className="h-[8px] w-[8px] rounded-full bg-[rgba(255,185,0,0.8)]" />
                    <span className="h-[8px] w-[8px] rounded-full bg-[rgba(0,212,146,0.8)]" />
                  </div>
                  <span className="font-miletus text-[14px] font-medium leading-[20px] text-[var(--white)]">
                    body
                  </span>
                </div>

                <div
                  aria-hidden={!showResponse}
                  className={cn(
                    "hidden items-center gap-space-12 transition-opacity duration-200 lg:flex",
                    showResponse ? "opacity-100" : "opacity-0",
                  )}
                >
                  <span className="font-paragraph-12 text-[var(--text-4)]">
                    Status: <span className="text-[var(--green-700)]">200</span>{" "}
                    OK
                  </span>
                  <span className="h-[14px] w-px bg-[rgba(255,255,255,0.2)]" />
                  <span className="font-paragraph-12 text-[var(--text-4)]">
                    Time:{" "}
                    <span className="text-[var(--green-700)]">160 ms</span>
                  </span>
                  <span className="h-[14px] w-px bg-[rgba(255,255,255,0.2)]" />
                  <span className="font-paragraph-12 text-[var(--text-4)]">
                    Size: <span className="text-[var(--green-700)]">2 KB</span>
                  </span>
                </div>
              </div>

              <div className="grid h-[268px] grid-cols-[28px_1fr] gap-space-12 p-space-24">
                {showResponse ? (
                  <>
                    <div className="font-mono-12 uppercase leading-[20px] text-[var(--text-4)]">
                      {responseLines.map((_, i) => (
                        <div className="h-[20px]" key={i}>
                          {String(i + 1).padStart(2, "0")}
                        </div>
                      ))}
                    </div>
                    <div className="overflow-x-auto font-mono-12 leading-[20px] text-[var(--white)]">
                      {responseLines.map((line, i) => (
                        <div className="h-[20px] whitespace-pre" key={i}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="col-span-2" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
