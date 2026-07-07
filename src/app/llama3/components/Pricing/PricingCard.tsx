import * as React from "react";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./pricing.module.scss";
import { cn } from "@/lib/utils";
import Image from "next/image";
export interface PricingCardProps {
  model: string;
  other: string;
  our: string;
  save: string;
}
function getActualModel(model: string) {
  switch (model) {
    case "Llama-3.1-8B-Instruct":
      return "meta-llama/llama-3.1-8b-instruct";
    case "Llama-3.1-70B-Instruct":
      return "meta-llama/llama-3.1-70b-instruct";
    case "Llama-3-8B-Instruct":
      return "meta-llama/llama-3-8b-instruct";
    case "Llama-3-70B-Instruct":
      return "meta-llama/llama-3-70b-instruct";
    case "Llama-3.2-3B-Instruct":
      return "meta-llama/llama-3.2-3b-instruct";
    case "Llama-3.2-11B-Vision-Instruct":
      return "meta-llama/llama-3.2-11b-vision-instruct";
    default:
      return model;
  }
}
function getBtnId(model: string) {
  switch (model) {
    case "Llama-3.1-8B-Instruct":
      return CLICK_BTN_IDs.LLAMA3_PAGE_BTNS["PRICING_TRY_3.1_8B"];
    case "Llama-3.1-70B-Instruct":
      return CLICK_BTN_IDs.LLAMA3_PAGE_BTNS["PRICING_TRY_3.1_70B"];
    case "Llama-3-8B-Instruct":
      return CLICK_BTN_IDs.LLAMA3_PAGE_BTNS["PRICING_TRY_3_8B"];
    case "Llama-3-70B-Instruct":
      return CLICK_BTN_IDs.LLAMA3_PAGE_BTNS["PRICING_TRY_3_70B"];
    case "Llama-3.2-3B-Instruct":
      return CLICK_BTN_IDs.LLAMA3_PAGE_BTNS["PRICING_TRY_3.2_3B"];
    case "Llama-3.2-11B-Vision-Instruct":
      return CLICK_BTN_IDs.LLAMA3_PAGE_BTNS["PRICING_TRY_3.2_11B"];
    default:
      return model;
  }
}
export const PricingCard: React.FC<PricingCardProps> = ({
  model,
  other,
  our,
  save,
}) => {
  return (
    <article className={cn(styles.card_item, "flex flex-col flex-1")}>
      <section className="flex flex-col py-[22px] px-[24px] w-full h-ful gap-[16px]">
        <Image
          src="/llama3/model_icon.svg"
          alt="model_icon"
          width={24}
          height={24}
        />
        <h2 className="font-h6">{model}</h2>
        <div className="flex flex-col w-full">
          <div className="text-common-dark-1">
            <span>Other Providers</span>{" "}
            <span className="font-medium">{other}</span>
          </div>
          <div className="text-common-dark-1">
            <span>Our Price</span> <span className="font-medium">{our}</span>
          </div>
        </div>
        <div>
          <span className={styles.tag}>{save}</span>
        </div>
        <div>
          <Button
            className="inline-block"
            tabIndex={0}
            asChild
            id={getBtnId(model)}
          >
            <Link
              href={`${NOVITA_URL.MODEL_API_LLM_PLAYGROUND}#${getActualModel(model)}`}
            >
              {"Try Now"}
            </Link>
          </Button>
        </div>
      </section>
    </article>
  );
};
