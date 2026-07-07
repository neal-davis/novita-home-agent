"use client";

import styles from "./index.module.scss";
import { Button, ButtonArrow } from "@/components/ui/button";
import { LANGUAGE_MAP, fileExtra } from "./cfg";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as columnarData from "./animation/secondCard/data.json";
import { ServerCodeAnimation, OutputCodeAnimation } from "./component/code";
import { CODE_OBJ } from "./cfg";
import Cookies from "js-cookie";

import FooterBanner from "@/app/components/pageComponents/FooterBanner";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n, useI18nSubscription } from "@/i18n/provider";

import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export const MyButton = Button;

interface MainPageProps {
  isLogin?: boolean;
}
const MainPage = ({ isLogin }: MainPageProps) => {
  useI18nSubscription();
  const { locale } = useI18n();

  const router = useRouter();
  const [showOutput, setShowOutput] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showColumnar, setShowColumnar] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [codeType, setCodeType] = useState("python");
  const secondTitle = useRef<any>();
  const fiveTitle = useRef<any>();
  const sevenTitle = useRef<any>();
  const eightTitle = useRef<any>();
  const columnarRef = useRef<any>();
  const codeRef = useRef<any>();
  useEffect(() => {
    setShowLogin(!Cookies.get("token"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === eightTitle.current) {
            if (entry && entry.target) {
              entry.target.setAttribute(
                "class",
                `${styles.cardTitle} ${styles.animationFadeIn} ${styles.boldFont}`,
              );
            }
          }
          if (entry.target === columnarRef.current) {
            setShowColumnar(true);
          }
          if (entry.target === codeRef.current) {
            setShowCode(true);
          }
        }
      });
    });

    const ele2 = secondTitle.current;
    const ele5 = fiveTitle.current;
    const ele7 = sevenTitle.current;
    const ele9 = columnarRef.current;
    const ele14 = codeRef.current;
    observer.observe(ele2);
    observer.observe(ele5);
    observer.observe(ele7);
    observer.observe(ele9);
    observer.observe(ele14);
    return () => {
      if (observer) {
        observer.unobserve(ele2);
        observer.unobserve(ele5);
        observer.unobserve(ele7);
        observer.unobserve(ele9);
        observer.unobserve(ele14);
        observer.disconnect();
      }
    };
  }, []);
  const columnarAnimation = {
    loop: false,
    autoplay: true,
    animationData: columnarData,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  };
  const handleLogin = () => {
    router.push(
      getLocalizedPath(NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE, locale),
    );
  };

  return (
    <div className={`${styles.pageWrap} main-page-abc`}>
      <div className={styles.logoFilter}></div>
      <div className={`${styles.cardWrap}  max_width_container`}>
        <div className={`${styles.firstCard}`}>
          <div className={styles.leftWrap}>
            <h2 className="font-h2">GPU Instance</h2>
            <h2 className={`font-h2 ${styles.heroTitleSpacing}`}>
              Scale Your AI Innovations
            </h2>
            <p className="font-body-medium">
              Empowering AI innovation with our cost-efficient, easy-access GPU
              cloud.
            </p>
            <div className={styles.heroCtaWrap}>
              <Button
                asChild
                variant="default"
                className={`px-8 ${styles.ctaButton}`}
              >
                <a
                  className={`${styles.cardBaseBtn}`}
                  target="_blank"
                  href={getLocalizedPath(
                    NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE,
                    locale,
                  )}
                  id={CLICK_BTN_IDs.INSTANCE_BTNS.START_BUILDING_NOW}
                >
                  <span>Start Building Now</span>
                  <ButtonArrow />
                </a>
              </Button>
            </div>
          </div>
          <div className={styles.rightWrap}>
            <img
              className={styles.heroDashboard}
              src="/gpu-instance/home/dashboard.png"
              alt="dashboard"
            />
          </div>
        </div>
      </div>
      <div
        className={`${styles.cardWrap} ${styles.relativeWrap} max_width_container`}
      >
        <div className={`${styles.senondCard}`}>
          <div className={styles.secondAnimationWrap}>
            <div
              ref={secondTitle}
              className={`${styles.cardMainTitle} font-h3`}
            >
              Save up to 50% on Costs
            </div>
            <div className={`${styles.cardMainTitleDesc} font-p-medium`}>
              Slash your cloud costs in half, without compromising your
              capabilities.
            </div>
          </div>
          <div ref={columnarRef} className={styles.towSideCard}>
            {showColumnar && (
              <div
                className={`${styles.secondAnimation} ${styles.animationFrame}`}
              >
                <Lottie {...columnarAnimation} height={"100%"} />
                <div className={styles.descStat}>
                  Hourly cost per NVIDIA A100 SXM GPU for on-demand cloud
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.grayBand}>
        <div
          className={`${styles.cardWrap} ${styles.relativeWrap} max_width_container`}
        >
          <div className={`${styles.senondCard} ${styles.revert}`}>
            <div className={`${styles.towSideCard} ${styles.halfFull}`}>
              <div
                className={`${styles.secondAnimation} ${styles.animationFrame}`}
              >
                <img
                  src="/gpu-instance/home/consoleImg.png"
                  width={714}
                  height={553}
                  alt="banner"
                />
              </div>
            </div>
            <div className={styles.secondAnimationWrap}>
              <div
                ref={secondTitle}
                className={`${styles.cardMainTitle} font-h3`}
              >
                Pay For What You Use
              </div>
              <div className={`${styles.cardMainTitleDesc} font-p-medium`}>
                Global Cheapest Cloud for AI. Only pay for what you use, when
                you use it.
              </div>
              <div
                className={`${styles.cardButtonContainer} ${styles.cardButtonOffset}`}
              >
                <Button
                  className={`px-8 ${styles.ctaButton}`}
                  variant="default"
                  asChild
                >
                  <a
                    className={`${styles.cardBaseBtn}`}
                    target="_blank"
                    href={getLocalizedPath(
                      NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE,
                      locale,
                    )}
                    id={CLICK_BTN_IDs.INSTANCE_BTNS.START_BUILDING_NOW}
                  >
                    <span>See More</span>
                    <ButtonArrow />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${styles.cardWrap} ${styles.relativeWrap} max_width_container`}
      >
        <div className={styles.senondCard}>
          <div className={`${styles.secondAnimationWrap} ${styles.halfFull}`}>
            <div
              ref={secondTitle}
              className={`${styles.cardMainTitle} font-h3`}
            >
              Simplify AI with Ease: 3 Clicks
            </div>
            <div className={`${styles.cardMainTitleDesc} font-p-medium`}>
              Instant access to Jupyter, pre-installed with Tensorflow, Pytorch,
              cuDNN, CUDA, TensorRT, Llama3 and Stable Diffusion. Novita AI
              enables access to GPU cloud services directly through your
              browser.
            </div>
          </div>
          <div className={`${styles.towSideCard} ${styles.halfFull}`}>
            <div
              className={`${styles.secondAnimation} ${styles.animationFrame} ${styles.animationFrameEnd}`}
            >
              <img
                className={styles.companyImage}
                src="/gpu-instance/home/companys.png"
                alt="company"
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.grayBand}>
        <div className={`${styles.cardWrap}  max_width_container`}>
          <div className={styles.fiveCard}>
            <div ref={fiveTitle} className={`${styles.cardMainTitle} font-h3`}>
              Free, Large-capacity Storage, <br />
              No Transfer Fees.
            </div>
            <div className={styles.cardContent}>
              <div className={styles.content1}>
                <img
                  className={styles.contentImg}
                  alt="bill"
                  src="/gpu-instance/home/bill.svg"
                />
                <div>
                  <div className={`${styles.contentTitle} ${styles.thinFont}`}>
                    Get 100GB Free
                  </div>
                  <div
                    className={`${styles.contentSubTitle} ${styles.thinFont}`}
                  >
                    Store as much as 2 Llama-3-13b models!
                  </div>
                </div>
                {/* <img className={styles.border} src="/gpu-instance/home/border-gradient.svg" /> */}
              </div>
              <div className={styles.content2}>
                <img
                  className={styles.contentImg}
                  alt="icon"
                  src="/gpu-instance/home/trangle.svg"
                />
                <div>
                  <div className={`${styles.contentTitle} ${styles.thinFont}`}>
                    Cloud Storage
                  </div>
                  <div
                    className={`${styles.contentSubTitle} ${styles.thinFont}`}
                  >
                    Quickly attach and scale volumes while effortlessly
                    switching between containers.
                  </div>
                </div>
                {/* <img className={styles.border} src="/gpu-instance/home/border-gradient.svg" /> */}
              </div>
              <div className={styles.content3}>
                <img
                  className={styles.contentImg}
                  alt="icon"
                  src="/gpu-instance/home/lingxin.svg"
                />
                <div>
                  <div className={`${styles.contentTitle} ${styles.thinFont}`}>
                    Scale Storage Easily
                  </div>
                  <div
                    className={`${styles.contentSubTitle} ${styles.thinFont}`}
                  >
                    From 5GB to petabytes at a moment&apos;s notice.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className={`${styles.earthCard} max_width_container`}>
          <div className={`${styles.card} ${styles.card2}`}>
            <div className={`${styles.cardContent} `}>
              <div className={`font-h3`}>
                Global Reach, Local Speed: <br />
                Deploy GPUs Anywhere, Instantly
              </div>
              <div className={`${styles.cardSubtitle} font-p-medium`}>
                Deploy GPUs closer to your users for minimal latency. Our
                worldwide nodes ensure fast, local access everywhere.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${styles.cardWrap} ${styles.centerCardWrap} max_width_container`}
      >
        <div className={styles.sevenCard}>
          <div className={styles.leftCard}>
            <div
              ref={sevenTitle}
              className={`${styles.cardTitle} ${styles.boldFont} font-h3`}
            >
              Easy-to-use APIs
            </div>
            <span
              className={`${styles.cardSubTitle} ${styles.thinFont} font-p-medium`}
            >
              Manage and optimize your workflows with our developer-friendly
              API, allowing you to launch, terminate, and restart instances
              effortlessly. <br />
              Discover more in our API developer docs.
              <div className={styles.apiLink} onClick={handleLogin}>
                Get Started&nbsp;&gt;
              </div>
            </span>
            <div className={styles.languageWrap}>
              {LANGUAGE_MAP.map((item) => (
                <div key={item.iconName}>
                  <Button
                    className={`px-8 ${styles.languageButton}`}
                    variant={codeType === item.iconName ? "default" : "outline"}
                    key={item.iconName}
                    onClick={() => {
                      setCodeType(item.iconName);
                      setShowOutput(false);
                    }}
                  >
                    <img
                      className={
                        item.iconName === "php" ? styles.phpLanguage : ""
                      }
                      src={`/gpu-instance/home/${item.iconName}.svg`}
                      alt="language"
                    />
                    <span
                      className={`${styles.languageText} ${styles.thinFont}`}
                    >
                      {item.text}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.rightCard}>
            <div className={styles.code}>
              <div className={styles.header}>
                <div className={`${styles.dotWrap} ${styles.absoluteDotWrap}`}>
                  <div className={styles.dot1} />
                  <div className={styles.dot2} />
                  <div className={styles.dot3} />
                </div>
              </div>
              <div
                className={`${styles.outputHeader} ${styles.codeOutputHeader}`}
              >
                <div className={styles.fileNameWrap}>
                  <span className={`${styles.fileName}`}>
                    {`instance.${fileExtra[codeType]}`}
                  </span>
                </div>
              </div>
              <div ref={codeRef} className={styles.serverCodeFrame}>
                {showCode && (
                  <ServerCodeAnimation
                    codeType={codeType}
                    codeContent={CODE_OBJ[codeType]}
                    updateOutputStatus={() => setShowOutput(true)}
                  />
                )}
              </div>
            </div>
            <div className={styles.code}>
              <div className={styles.header}>
                <div className={`${styles.dotWrap} ${styles.absoluteDotWrap}`}>
                  <div className={styles.dot1} />
                  <div className={styles.dot2} />
                  <div className={styles.dot3} />
                </div>
              </div>
              {showOutput && <OutputCodeAnimation />}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.cardWrap}>
        {/* <div className={styles.eightCard}>
          <div
            ref={eightTitle}
            className={`${styles.cardTitle} ${styles.boldFont}`}
          >
            Always-On GPU Support, backed by trust
          </div>
          <div className={styles.cardContent}>
            <table className={styles.supportTable}>
              <thead>
                <tr>
                  <th>Always-On Support</th>
                  <th>Contact us immediately</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Our tech team is ready to solve your GPU Instance issues anytime.</td>
                  <td>
                    <span>Email: support@novita.ai</span>
                    <a href="https://discord.gg/yntJ6VEX2J" target="_blank">
                      <img className={styles.svgFirst} src="/gpu-instance/contact/discord.svg" />
                    </a>
                    <a href="https://twitter.com/infrai_cloud" target="_blank">
                      <img className={styles.svg} src="/gpu-instance/contact/x.svg" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> */}
      </div>
      <FooterBanner />
      {/* {(showLogin || !isLogin) && <BigTextFooter />} */}
    </div>
  );
};
export default MainPage;
