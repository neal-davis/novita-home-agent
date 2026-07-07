"use client";

import Image from "next/image";
import { useI18nSubscription } from "@/i18n/provider";

/**
 * LogoCloud section — "Trusted by"
 *
 * Figma node: 900:8368 (file 3nHa4z8enopB5YGSneFZlK)
 */

interface LogoItem {
  name: string;
  src: string;
  width: number;
  height: number;
  displayWidth: number;
}

const LOGOS: LogoItem[] = [
  {
    name: "Hugging Face",
    src: "/home/logos-cloud/huggingface.png",
    width: 470,
    height: 126,
    displayWidth: 165,
  },
  {
    name: "TiDB",
    src: "/home/logos-cloud/tidb.png",
    width: 216,
    height: 88,
    displayWidth: 72,
  },
  {
    name: "Kilo Code",
    src: "/home/logos-cloud/kilo.png",
    width: 424,
    height: 108,
    displayWidth: 141,
  },
  {
    name: "Quora",
    src: "/home/logos-cloud/quora.png",
    width: 219,
    height: 69,
    displayWidth: 73,
  },
  {
    name: "OpenRouter",
    src: "/home/logos-cloud/openrouter.png",
    width: 474,
    height: 72,
    displayWidth: 158,
  },
  {
    name: "Fish Audio",
    src: "/home/logos-cloud/fishaudio.png",
    width: 627,
    height: 102,
    displayWidth: 204,
  },
  {
    name: "Hygo",
    src: "/home/logos-cloud/hygo.png",
    width: 170,
    height: 72,
    displayWidth: 57,
  },
  {
    name: "Gizmo",
    src: "/home/logos-cloud/gizmo.png",
    width: 294,
    height: 86,
    displayWidth: 98,
  },
  {
    name: "Simular",
    src: "/home/logos-cloud/simular.png",
    width: 3352,
    height: 720,
    displayWidth: 130,
  },
  {
    name: "Wiz",
    src: "/home/logos-cloud/wiz.png",
    width: 360,
    height: 102,
    displayWidth: 120,
  },
];

function LogoCell({ logo }: { logo: LogoItem }) {
  return (
    <div className="flex h-[84px] min-w-0 items-center justify-center px-[20px] py-[12px]">
      <Image
        src={logo.src}
        alt={logo.name}
        width={logo.width}
        height={logo.height}
        unoptimized
        sizes={`${logo.displayWidth}px`}
        className="h-auto max-h-[36px] max-w-full object-contain"
        style={{
          width: logo.displayWidth,
        }}
      />
    </div>
  );
}

export default function LogoCloud() {
  useI18nSubscription();

  return (
    <section className="w-full bg-[var(--bg-default)]">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col items-center gap-[12px] px-[32px] py-[24px]">
        <div className="flex w-full items-center justify-center py-[12px]">
          <p className="font-mono-14 uppercase text-[var(--text-2)]">
            Trusted by
          </p>
        </div>

        <div className="grid w-full max-w-[1240px] grid-cols-2 overflow-hidden md:grid-cols-5">
          {LOGOS.map((logo) => (
            <LogoCell key={logo.name} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
