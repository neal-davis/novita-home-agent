import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type CardProps = {
  product: string;
  link: string;
  title: string;
  subTitle: string;
  footerTitle: string;
};

/** Figma 746:39618 — card 01 plain beige; cards 02–04 use exported art (last three). */
const CARD_INDEX: Record<string, string> = {
  "model-api": "01",
  serverless: "02",
  "gpu-instance": "03",
  sandbox: "04",
};

function cardBackgroundImage(product: string): string | undefined {
  switch (product) {
    case "serverless":
      return "url(/error-boundray/card-bg-01.png)";
    case "gpu-instance":
      return "url(/error-boundray/card-bg-02.png)";
    case "sandbox":
      return "url(/error-boundray/card-bg-03.png)";
    default:
      return undefined;
  }
}

export default function Card({ item }: { item: CardProps }) {
  const bgImage = cardBackgroundImage(item.product);
  const indexLabel = CARD_INDEX[item.product] ?? "01";

  return (
    <Link
      href={item.link}
      className="group relative flex h-[240px] w-full flex-col justify-between overflow-hidden bg-[#f2f1ec] p-[var(--space-24)] transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] focus-visible:ring-offset-2"
      style={
        bgImage
          ? {
              backgroundImage: bgImage,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      <span className="font-mono-14 leading-6 text-[var(--text-1)] opacity-60">
        {indexLabel}
      </span>

      <div className="flex flex-col gap-[12px] opacity-80">
        <p className="font-heading-h5 text-[var(--text-1)]">{item.title}</p>
        <p className="font-paragraph-18 text-[var(--text-3)] whitespace-pre-line">
          {item.subTitle}
        </p>
      </div>

      <div className="flex items-center gap-2 font-paragraph-15 text-[var(--text-1)]">
        <span>{item.footerTitle}</span>
        <ChevronRight
          className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </Link>
  );
}
