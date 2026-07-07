"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { dealGPUMoney } from "@/lib/utils/money";
import { NOVITA_URL } from "@/constants/urls";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import styles from "./ModelInfo.module.scss";
const GPU_NAME = "RTX 4090 24GB";
interface InstancePriceObject {
  discount?: string;
}
interface PriceProps {
  productId: string;
  productName?: string;
  cpuNum?: number;
  expansion?: number;
  maxLocalStorage?: number;
  freeStorage: number;
  gpuMemory?: number;
  memory: number;
  instancePrice?: InstancePriceObject;
  savingPlan: Array<any>;
}
export default function GPUCard({
  copy,
  templateId,
}: {
  copy?: unknown;
  templateId: string;
}) {
  const [price, setPrice] = useState<string>("");
  const [gpuInfo, setGpuInfo] = useState<{
    name: string;
    id: string;
  }>({
    name: "",
    id: "",
  });
  const [isFloating, setIsFloating] = useState(false);
  const deployBtnRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    reqMarketProducts({}).then((res: { products: PriceProps[] }) => {
      const current = (res.products || []).find(
        (item) => item.productName === GPU_NAME,
      );
      if (current && current.instancePrice?.discount) {
        setPrice(`$${dealGPUMoney(+current.instancePrice.discount)}/GPU/hr`);
        setGpuInfo({
          name: current.productName || "",
          id: current.productId,
        });
      }
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFloating(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    const currentRef = deployBtnRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);
  const handleClick = useCallback(() => {
    analytics.trackClick(CLICK_BTN_IDs.TEMPLATES.DEPLOY);
  }, []);
  return (
    <>
      <div className={styles.gpu_info}>
        <div className={styles.card}>
          <p className={styles.tips}>{"One click deployment"}</p>
          <div className={styles.gpu_name}>{gpuInfo.name}</div>
          <div className="flex flex-row flex-wrap justify-between items-center">
            <div>
              <span className={styles.price_tips}>{"On Demand"}</span>
              <span className={styles.price}>{price}</span>
            </div>
            <Button asChild size="lg" className={styles.deploy_box}>
              <Link
                target="_blank"
                ref={deployBtnRef}
                href={`${NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE}?templateId=${templateId || ""}&productId=${gpuInfo.id || ""}`}
                onClick={handleClick}
              >
                {"Deploy"}
              </Link>
            </Button>
          </div>
        </div>
        <Image
          alt="gpu hot"
          src="/templates/gpu_hot.png"
          width={38}
          height={64}
          className={styles.gpu_hot}
        />
      </div>
      {isFloating && (
        <Button
          asChild
          size="lg"
          className={`{styles.deploy_box} ${styles.float_deploy_box}`}
        >
          <Link
            target="_blank"
            href={`${NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE}?templateId=${templateId || ""}&productId=${gpuInfo.id || ""}`}
            onClick={handleClick}
          >
            {"Deploy"}
          </Link>
        </Button>
      )}
    </>
  );
}
