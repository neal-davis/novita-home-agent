"use client";
import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./NotFound.module.scss";
import Card, { CardProps } from "./Card";
import { SUPPORT_EMAIL_LINK } from "@/constants/urls";
import FUNCS from "@/app/models/constants/funcs";
import { FUNC_NAME } from "@/app/models/constants/funcs";
const genDescDom = (oriText: string): ReactNode => {
  const domArr: ReactNode[] = [];
  const oriTextArr = oriText.split("{{support_email}}");
  oriTextArr.forEach((cText, idx) => {
    const oriTextDepArr = cText.split("{{deprecation_date}}");
    oriTextDepArr.forEach((dText, idx) => {
      domArr.push(dText);
      if (idx !== oriTextDepArr.length - 1) {
        domArr.push(
          <span className="text-red-600">{"December 31, 2024"}</span>,
        );
      }
    });
    if (idx !== oriTextArr.length - 1) {
      domArr.push(
        <Link
          className={styles.link}
          href={`mailto:${SUPPORT_EMAIL_LINK}`}
          target="_blank"
        >
          {SUPPORT_EMAIL_LINK}
        </Link>,
      );
    }
  });
  return <>{...domArr}</>;
};
const deprecatedAPIs = [
  FUNC_NAME.ADETAILER,
  "Flux.1 [dev] ControlNet Text to Image",
  FUNC_NAME.IMG2MASK,
  "InstantStyle",
  FUNC_NAME.ANIMATE_ANYONE,
  FUNC_NAME.TILE,
  FUNC_NAME.DOODLE,
  "facefusion",
  "Flux.1 [dev] Image to Image",
  "Flux.1 [schnell] Image to Image",
  FUNC_NAME.LCM_IMG2IMG,
  FUNC_NAME.LCM_TXT2IMG,
  FUNC_NAME.MAKE_PHOTO,
  FUNC_NAME.MIX_POSE,
  FUNC_NAME.RELIGHT,
  FUNC_NAME.REMOVE_WATERMARK,
  FUNC_NAME.REPLACE_SKY,
  FUNC_NAME.REPLACE_OBJECT,
  FUNC_NAME.UPSCALE,
  "Flux.1 [dev]",
  "Flux.1 [dev] LoRA",
  "Flux.1 [dev] LoRA Realism",
  FUNC_NAME.IMG2PROMPT,
  FUNC_NAME.MOTIONSYNC,
  FUNC_NAME.OUTPAINTING,
  FUNC_NAME.REIMAGINE,
  FUNC_NAME.RESTORE_FACE,
  FUNC_NAME.TRAINING,
  FUNC_NAME.VOICE_CLONING_INSTANT,
];
const deprecatedProducts = deprecatedAPIs.map((api) => {
  const func = Object.values(FUNCS).find((func) => func.name === api);
  if (func) {
    return func.displayName;
  }
  return api;
});
export default function Error() {
  const cards: CardProps[] = [
    {
      product: "model-api",
      link: "/model-api",
      title: "Build with Model APIs",
      subTitle: "Build Gen AI products seamlessly",
      footerTitle: "View Product",
    },
    {
      product: "serverless",
      link: "/serverless",
      title: "Scale with Serverless",
      subTitle: "Scale without managing GPU infrastructure",
      footerTitle: "View Product",
    },
    {
      product: "gpu-instance",
      link: "/gpu-instance",
      title: "Deploy with GPU Instance",
      subTitle: "Cut costs by up to 50%",
      footerTitle: "View Product",
    },
    {
      product: "sandbox",
      link: "/sandbox",
      title: "Launch Agent Sandbox",
      subTitle: "The Runtime Infrastructure for Secure & Scalable AI Agents",
      footerTitle: "View Product",
    },
  ];
  return (
    <div className={`${styles.error_page} max_width_container`}>
      <div className="px-web">
        <div
          className={`${styles.error_page_content} flex gap-x-[60px] lg:gap-x-[200px] gap-y-[40px] items-center flex-col sm:flex-row`}
        >
          <Image
            src="/deprecated.png"
            alt="end-of-service"
            width={220}
            height={220}
          />
          <div>
            <h2 className={"font-h2 text-[var(--dark-1)] mb-[32px]"}>
              {"Low Usage API Product Deprecation Plan"}
            </h2>
            <p className="font-p text-[var(--dark-2)]">
              {genDescDom(
                "Thank you for your continued support of Novita AI. Following a comprehensive review, we have made the decision to deprecate several API products due to lower-than-expected usage. In order to optimize resources and improve the overall user experience, these API products will be discontinued as of {{deprecation_date}}.",
              )}
            </p>
          </div>
        </div>
        <div className={`${styles.api_list}`}>
          <h4 className={"font-h4 text-[32px] mb-[20px]"}>
            {"Deprecated APIs:"}
          </h4>
          <ul className="list-none grid grid-cols-3">
            {deprecatedProducts.map((product) => (
              <li className={styles.api_item} key={product}>
                {product}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.block}>
          <h6 className={"font-h4 mb-1"}>{"Impact:"}</h6>
          <p className="font-body">
            {
              "As of the deprecation date, these APIs will no longer be accessible. We strongly encourage you to update your applications and workflows to prevent any potential disruptions."
            }
          </p>
        </div>
        <div className={`${styles.block} mt-4`}>
          <h6 className={"font-h4 mb-1"}>{"Next Steps:"}</h6>
          <ul>
            <li className="font-body">
              {
                "If you are currently using these APIs and require assistance transitioning to alternative solutions, our support team is available to guide you through the process."
              }
            </li>
            <li className="font-body">
              {genDescDom(
                "We appreciate your understanding and support. If you have any questions or need further assistance, please don't hesitate to contact us {{support_email}}.",
              )}
            </li>
          </ul>
        </div>
        <section
          aria-labelledby="end-of-service-suggestions-heading"
          className="mt-[90px] w-full pb-space-80"
        >
          <h2
            id="end-of-service-suggestions-heading"
            className="mx-auto mb-[60px] max-w-[960px] text-center font-miletus text-[24px] font-normal leading-[32px] tracking-[-0.48px] text-[var(--text-1)]"
          >
            {
              "If you're browsing around, just look at this one we've picked out for you!"
            }
          </h2>
          <div className="mx-auto grid w-full max-w-[1040px] grid-cols-1 gap-[24px] sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((item: CardProps) => (
              <Card key={item.product} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
