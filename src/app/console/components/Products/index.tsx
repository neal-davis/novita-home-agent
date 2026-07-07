"use client";

import Link from "next/link";
import Image from "next/image";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { NOVITA_URL } from "@/constants/urls";
import { ButtonArrow } from "@/components/ui/button";
import styles from "./index.module.scss";
import { cn } from "@/lib/utils";

interface ProductCardConfig {
  href: string;
  id: string;
  title: string;
  description: string;
  icon: string;
  iconAlt: string;
}

function createProductCards(): ProductCardConfig[] {
  return [
    {
      href: NOVITA_URL.MODEL_API_CONSOLE,
      id: CLICK_BTN_IDs.MAIN_CONSOLE.WITH_MODEL_API,
      title: "Explore Model APls",
      description: "Build and scale production apps on optimized models.",
      icon: "/console/products/models.svg",
      iconAlt: "models",
    },
    {
      href: NOVITA_URL.SANDBOX_CONSOLE,
      id: CLICK_BTN_IDs.MAIN_CONSOLE.WITH_SANDBOX,
      title: "Launch AI Agent Sandbox",
      description:
        "The Runtime Infrastructure for Secure & Scalable AI Agents.",
      icon: "/console/products/sandbox.svg",
      iconAlt: "sandbox",
    },
    {
      href: NOVITA_URL.GPU_CONSOLE_EXPLORE,
      id: CLICK_BTN_IDs.MAIN_CONSOLE.WITH_INSTANCE,
      title: "Deploy GPU Instance",
      description: "Build and scale production apps on optimized models.",
      icon: "/console/products/gpu.svg",
      iconAlt: "gpu",
    },
  ];
}

const ProductCard = ({
  index,
  config,
}: {
  index: number;
  config: ProductCardConfig;
}) => {
  return (
    <Link
      href={config.href}
      id={config.id}
      className={cn("group flex flex-1 cursor-pointer", styles.card)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md",
          styles.cardContent,
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 origin-center bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-150 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{
            backgroundImage: `url(/console/products/0${(index % 3) + 1}.png)`,
          }}
        />
        <div className="relative z-10 box-border px-6 py-4 pr-[80px]">
          <h3 className="relative flex items-center gap-2 pl-0 transition-[padding] duration-200 ease-out group-hover:pl-4">
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-1/2 h-2 w-0 -translate-y-1/2 overflow-hidden rounded-2 bg-brand-0 opacity-0 transition-all duration-200 ease-out group-hover:w-2 group-hover:opacity-100 motion-reduce:transition-none"
            />
            <div className="flex items-center gap-1">
              <span className="min-w-0 font-semibold xl:text-[18px]">
                {config.title}
              </span>
              <ButtonArrow className={styles.btnArrow} />
            </div>
          </h3>
          <p className="mt-1 text-[11px] italic">{config.description}</p>
          <div className="absolute right-0 top-0 flex h-full w-[80px] items-center justify-center">
            <Image
              src={config.icon}
              width={76}
              height={76}
              alt={config.iconAlt}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function Products() {
  const productCards = createProductCards();

  return (
    <div
      className="flex flex-col flex-start rounded-lg bg-black py-3 px-6 gap-3 bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: `url(/console/products/bg.png)`,
      }}
    >
      <h2 className="font-paragraph-20 text-white">Explore Products</h2>
      <div className="flex gap-3 w-full">
        {productCards.map((card, index) => (
          <ProductCard key={index} index={index} config={card} />
        ))}
      </div>
    </div>
  );
}
