"use client";

import Image from "next/image";
import SectionEyebrow from "./SectionEyebrow";
import { useI18n } from "@/i18n/provider";

/**
 * Sandbox Capabilities section
 *
 * Layout (Figma nodes 10925:269 / 10998:20041 / 11034:26390):
 * - Desktop (lg+): 2 rows × 3 columns, col 1 no border, cols 2-3 border-l gray-500
 * - Tablet (md): 3 rows × 2 columns, all items border-l subtle
 * - Mobile (<md): 3 rows × 2 columns, all items border-l subtle, compact padding
 *
 * Each card: number (001–006), illustration icon, title, description
 */

function createCapabilities() {
  return [
    {
      number: "001",
      icon: "/sandbox1/page/capabilities/code.png",
      iconW: 80,
      iconH: 116,
      title: "Code Execution",
      description:
        "Run Python, JavaScript, C++, and other languages in a secure sandbox.",
    },
    {
      number: "002",
      icon: "/sandbox1/page/capabilities/network.png",
      iconW: 85,
      iconH: 107,
      title: "External APIs",
      description:
        "Allow agents to access external APIs and online data as needed.",
    },
    {
      number: "003",
      icon: "/sandbox1/page/capabilities/browser.png",
      iconW: 88,
      iconH: 124,
      title: "Browser Use",
      description:
        "Automate web navigation, form filling, and data extraction inside the sandbox.",
    },
    {
      number: "004",
      icon: "/sandbox1/page/capabilities/computer.png",
      iconW: 97,
      iconH: 116,
      title: "Computer Use",
      description:
        "Control full desktop environments for typing, clicking, scrolling, screenshots, and other GUI actions.",
    },
    {
      number: "005",
      icon: "/sandbox1/page/capabilities/session.png",
      iconW: 88,
      iconH: 124,
      title: "Persistent Sessions",
      description:
        "Pause and resume long-running agent tasks without losing state.",
    },
    {
      number: "006",
      icon: "/sandbox1/page/capabilities/visual.png",
      iconW: 98,
      iconH: 107,
      title: "Live Session View",
      description:
        "View and stream sandbox sessions with VNC for interactive monitoring and debugging.",
    },
  ];
}

/** Returns className for each capability card based on its flat index (0–5). */
function cardClassName(i: number) {
  // In the 3-column desktop grid, columns 0 and 3 are the first column (no border).
  const isDesktopFirstCol = i % 3 === 0;
  return [
    "flex flex-col gap-6",
    // All cards: subtle left border on mobile/tablet
    "border-l border-[rgba(10,10,10,0.07)]",
    // Desktop: first col removes border; other cols keep the same subtle border
    isDesktopFirstCol ? "lg:border-l-0" : "",
    // Padding: compact on mobile, full horizontal on md+
    "p-4 md:pt-6 md:pb-4 md:px-10",
    // Desktop first col: no left padding (matches Figma pr-only)
    isDesktopFirstCol ? "lg:pl-0" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Capabilities() {
  useI18n();
  const capabilities = createCapabilities();

  return (
    <section className="w-full bg-white py-10 md:py-12 lg:py-[60px]">
      <div className="mx-auto max-w-[1360px] px-5 md:px-12 lg:px-[48px]">
        <SectionEyebrow label="Sandbox Capabilities" />

        {/* Figma：主标题 + Supporting text `1:6673`（P20 / mid-em / max 430） */}
        <div className="mt-6 flex max-w-[430px] flex-col gap-space-16">
          <h2 className="font-miletus font-heading-h5 text-element-high-em md:font-heading-h2">
            Core runtime capabilities
          </h2>
          <p className="font-miletus font-paragraph-20 text-element-mid-em">
            Everything agents need to execute code, interact with systems, and
            stay in control across real-world workflows.
          </p>
        </div>

        {/* 2 cols on mobile/tablet, 3 cols on desktop */}
        <div className="mt-10 grid grid-cols-2 gap-y-6 pt-10 lg:grid-cols-3">
          {capabilities.map((item, i) => (
            <div key={item.number} className={cardClassName(i)}>
              <span className="font-tt-mono text-[14px] leading-[14px] text-[rgba(10,10,10,0.6)]">
                {item.number}
              </span>

              <div className="h-[116px] flex items-end">
                <Image
                  src={item.icon}
                  alt={item.title}
                  width={item.iconW}
                  height={item.iconH}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col gap-5">
                {/* 20px on mobile, 24px on tablet+ */}
                <h3 className="text-xl md:text-2xl leading-[26px] font-normal text-gray-950">
                  {item.title}
                </h3>
                {/* 15px/22px on mobile, 18px/26px on tablet+ */}
                <p className="text-[15px] leading-[22px] md:text-[18px] md:leading-[26px] text-[var(--text-3)]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
