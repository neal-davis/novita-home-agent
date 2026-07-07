import Link from "next/link";
import { Button } from "@/components/ui/button";
import styles from "./FirstPage.module.scss";
import { DISCORD_INVITE_LINK } from "@/constants/urls";
import { NOVITA_URL } from "@/constants/urls";
import {
  type GpuData,
  type GpuLandingPageContent,
} from "../gpuLandingPageData";

export default function FirstPage({
  content,
  gpuData,
}: {
  content: GpuLandingPageContent;
  gpuData: GpuData;
  productData: any;
}) {
  return (
    <div className={`${styles.page_wrapper}`}>
      <div className={`max_width_container`}>
        <div
          className="mx-web flex justify-start pb-8 sm:bg-[url(/gpu-instance/gpu-landingpage/bg.svg)]"
          style={{
            backgroundSize: "484px 187px",
            backgroundPosition: "right bottom",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="max-w-[510px] flex flex-col gap-8">
            <h1 className="font-h1">{gpuData.model}</h1>
            <p className="font-p">{gpuData.description}</p>
            <div className="flex gap-5">
              <Button asChild>
                <Link href={NOVITA_URL.GPU_CONSOLE_EXPLORE}>
                  {content.getStartedButton.label}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={DISCORD_INVITE_LINK} target="_blank">
                  {content.discordButton.label}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
