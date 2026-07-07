import { ReactNode } from "react";
import Link from "next/link";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import styles from "./FirstPage_new.module.scss";
import { Button, ButtonArrow } from "@/components/ui/button";

type MainPageProps = {
  title?: React.ReactNode;
  introduce?: ReactNode;
  getStartedUrl?: string;
  apiUrl?: string;
  playgroundUrl?: string;
  pricingUrl?: string;
  TryBtnTxt?: string;
  operateBtns?: ReactNode;
};

export default function MainPage({
  title,
  introduce,
  operateBtns,
  apiUrl,
  playgroundUrl,
  pricingUrl,
  TryBtnTxt,
}: MainPageProps) {
  return (
    <div className={`${styles.page}`}>
      <div className="max_width_container">
        <div className={`${styles.content} px-web`}>
          <h1 className={`${styles.title} text-6xl mb-6`}>
            {title || `One AI Platform, Infinite Possibilities`}
          </h1>
          <h2 className={`${styles.description} text-base`}>
            {introduce ||
              `Explore the full spectrum of AI APIs tailored for image, video, audio, and LLM applications. Novita AI is designed to elevate your AI-driven business at the pace of technology, offering model hosting and training solutions.`}
          </h2>
          <div className={styles.operate}>
            {operateBtns || (
              <>
                <Button size="lg" asChild>
                  <Link href={apiUrl || DOCS_URL.HOME} target="_blank">
                    <span>API Reference</span>
                    <ButtonArrow />
                  </Link>
                </Button>
                {playgroundUrl && (
                  <Button size="lg" asChild>
                    <Link
                      href={playgroundUrl || NOVITA_URL.MODEL_API_PLAYGROUND}
                      target="_blank"
                    >
                      {TryBtnTxt || `Start Creating Free`}
                    </Link>
                  </Button>
                )}
                {pricingUrl && (
                  <Button size="lg" asChild>
                    <Link href={pricingUrl} target="_blank">
                      See Pricing
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
