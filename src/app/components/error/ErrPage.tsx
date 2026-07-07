"use client";
import { ReactNode, useEffect } from "react";
import Button from "@/app/components/button/Button";
import styles from "./NotFound.module.scss";
import Card, { CardProps } from "./Card";
import { DISCORD_INVITE_LINK, SUPPORT_EMAIL_LINK } from "@/constants/urls";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store";
type ErrProps = {
  page: "error" | "404";
  error?: Error & {
    digest?: string;
  };
  reset?: () => void;
};
/** Figma 751:41227 — hero primary; width = content (avoid flex-col stretch) */
const HERO_PRIMARY_CTA_CLASS =
  "!h-10 !min-h-0 !rounded-full !bg-[var(--gray-950)] !text-[var(--white)] hover:!bg-[var(--gray-800)] !px-3 font-paragraph-16 shadow-[0px_1px_3px_0px_var(--alpha-dark-10),inset_0px_2px_0px_0px_var(--alpha-light-20)]";
export default function Error({ page, error, reset }: ErrProps) {
  const uuid = useAppSelector((state) => state.user.uuid);
  const pathname = usePathname();
  useEffect(() => {
    if (page === "error" && window.__MONITOR__) {
      try {
        window.__MONITOR__.add({
          error_type: "boundaryError",
          lineNumber: "",
          stack: error?.stack,
          message: error?.message,
          context: "",
          user_id: uuid,
          page: pathname,
          errorno: "",
          caller: "",
        } as ErrorReport);
      } catch (error) {
        console.log(error);
      }
    }
  }, [page, error, uuid, pathname]);
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
  const genDescDom = (): ReactNode => {
    const domArr: ReactNode[] = [];
    const oriText =
      page === "404"
        ? "Sorry, we can't find the page you're looking for. If you followeed a broken link from\nsomewhere, you can hop into our {{discord_channel}} or {{contact_us}} and let us know."
        : "We're experiencing some technical issues. Please try again later. Or you can hop into our {{discord_channel}} or {{contact_us}} and let us know.";
    const oriTextDiscordArr = oriText.split("{{discord_channel}}");
    oriTextDiscordArr.forEach((dText, idx) => {
      const oriTextContactArr = dText.split("{{contact_us}}");
      oriTextContactArr.forEach((cText, idx) => {
        domArr.push(cText);
        if (idx !== oriTextContactArr.length - 1) {
          domArr.push(
            <a
              key={`clink_${idx}`}
              className="font-paragraph-18 text-[var(--text-3)] underline underline-offset-2 decoration-solid hover:opacity-80 transition-opacity"
              href={`mailto:${SUPPORT_EMAIL_LINK}`}
              target="_blank"
              rel="noreferrer"
            >
              {"contact us"}
            </a>,
          );
        }
      });
      if (idx !== oriTextDiscordArr.length - 1) {
        domArr.push(
          <a
            key={`dlink_${idx}`}
            className="font-paragraph-18 text-[var(--text-3)] underline underline-offset-2 decoration-solid hover:opacity-80 transition-opacity"
            href={DISCORD_INVITE_LINK}
            target="_blank"
            rel="noreferrer"
          >
            {"Discord channel"}
          </a>,
        );
      }
    });
    return <>{...domArr}</>;
  };
  return (
    <div className={styles.error_page}>
      <div
        className={`${styles.error_page_content} relative w-full overflow-hidden`}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-layout-safe -translate-x-1/2 bg-cover bg-top bg-no-repeat"
          style={{
            backgroundImage: "url(/error-boundray/hero-bg.png)",
          }}
          aria-hidden="true"
        />
        {/* Figma 751:41227 — left column, max 560px, 24 / 48 vertical rhythm */}
        <div className="relative z-10 mx-auto flex w-full max-w-layout-nav flex-col items-start px-5 md:px-8 lg:px-5">
          <div className="flex w-full max-w-[560px] flex-col gap-12 px-0.5 pb-6">
            <div className="flex flex-col gap-6">
              <h1 className="font-display-md text-[var(--text-1)]">
                {page === "404" ? "Page not found" : "Error"}
              </h1>
              <p className="max-w-[400px] font-paragraph-18 leading-6 text-[var(--text-3)]">
                {genDescDom()}
              </p>
            </div>
            {page === "404" ? (
              <Button
                type="primary"
                height={40}
                renderTag="link"
                link="/"
                className={`${HERO_PRIMARY_CTA_CLASS} self-start w-fit shrink-0`}
              >
                {"Go to home page"}
              </Button>
            ) : (
              <Button
                type="primary"
                height={40}
                className={`${HERO_PRIMARY_CTA_CLASS} self-start w-fit shrink-0`}
                onClick={() => {
                  reset && reset();
                }}
              >
                {"Refresh"}
              </Button>
            )}
          </div>
        </div>
      </div>
      <section
        aria-labelledby="error-suggestions-heading"
        className={
          page === "404"
            ? "w-full px-5 pb-space-80 pt-[56px] md:px-8 md:pt-[72px] lg:px-[48px]"
            : "w-full px-web pb-space-80 pt-[90px]"
        }
      >
        <h2
          id="error-suggestions-heading"
          className={
            page === "404"
              ? "mx-auto mb-[60px] max-w-[960px] text-center font-miletus text-[24px] font-normal leading-[32px] tracking-[-0.48px] text-[var(--text-1)]"
              : "mx-auto mb-[60px] max-w-[960px] text-center font-miletus text-[24px] font-normal leading-[32px] tracking-[-0.48px] text-[var(--text-1)]"
          }
        >
          {
            "If you're browsing around, just look at this one we've picked out for you!"
          }
        </h2>
        <div
          className={
            page === "404"
              ? "mx-auto grid w-full max-w-[1360px] grid-cols-1 gap-[24px] sm:grid-cols-2 xl:grid-cols-4"
              : "mx-auto grid w-full max-w-[1040px] grid-cols-1 gap-[24px] sm:grid-cols-2 xl:grid-cols-4"
          }
        >
          {cards.map((item: CardProps) => (
            <Card key={item.product} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
