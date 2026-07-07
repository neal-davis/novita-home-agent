import Image from "next/image";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import styles from "./Plan.module.scss";
import { Button, ButtonArrow } from "@/components/ui/button";
export default function Plan({ copy }: { copy?: unknown }) {
  return (
    <div
      className="relative"
      style={{
        background:
          "linear-gradient(270deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.80) 51%)",
      }}
    >
      <div className={styles.bg_container}>
        <div className="max_width_container flex flex-col justify-center gap-4 h-[310px]">
          <div>
            <Image
              width={100}
              height={17}
              src={"/llama3/logo.svg"}
              alt="logo"
              priority
              style={{
                userSelect: "none",
                display: "inline-block",
              }}
            />
            <h2 className="font-h3 text-white mt-[26px] mb-[30px] max-w-[537px]">
              {"Choose a pricing plan that suits you"}
            </h2>
            <Button variant="link" className="hover:no-underline" asChild>
              <Link
                href={NOVITA_URL.PRICING}
                id={CLICK_BTN_IDs.LLAMA3_PAGE_BTNS.PLAN}
                target="_blank"
              >
                <span className="hover:underline">See pricing</span>
                <ButtonArrow
                  style={{
                    color: "var(--brand-0)",
                  }}
                />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
