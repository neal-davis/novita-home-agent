"use client";

import styles from "./GPUPricing.module.scss";
import GPUPricingCard from "./GPUPricingCard";
import Image from "next/image";
import { Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { useEffect, useState } from "react";

// const pricing = [{
//   title1: "RTX",
//   title2: "4090",
//   memory: "24",
//   no: "1x",
//   price: "0.35",
//   no8: "8x",
//   price8: "2.80"
// }, {
//   title1: "A100",
//   title2: "SXM4",
//   memory: "80",
//   no: "1x",
//   price: "1.60",
//   no8: "8x",
//   price8: "12.80"
// }, {
//   title1: "RTX",
//   title2: "3090",
//   memory: "24",
//   no: "1x",
//   price: "0.35",
//   no8: "8x",
//   price8: "2.80"
// }, {
//   title1: "RTX",
//   title2: "6000 Ada",
//   memory: "24",
//   no: "1x",
//   price: "0.35",
//   no8: "8x",
//   price8: "2.80"
// }];
// const price1 = [{
//   title1: "RTX",
//   title2: "4090",
//   memory: "24",
//   no: "1x",
//   price: "0.35",
//   no8: "8x",
//   price8: "2.80"
// }, {
//   title1: "A100",
//   title2: "SXM4",
//   memory: "80",
//   no: "1x",
//   price: "1.60",
//   no8: "8x",
//   price8: "12.80"
// }];
// const price2 = [{
//   title1: "RTX",
//   title2: "3090",
//   memory: "24",
//   no: "1x",
//   price: "0.35",
//   no8: "8x",
//   price8: "2.80"
// }, {
//   title1: "RTX",
//   title2: "6000 Ada",
//   memory: "24",
//   no: "1x",
//   price: "0.35",
//   no8: "8x",
//   price8: "2.80"
// }];
// const pricing2 = [...pricing];

export default function GPUPricing() {
  const [price1, setPrice1] = useState([]);
  const [price2, setPrice2] = useState([]);
  const [pricing2, setPricing2] = useState([]);
  useEffect(() => {
    reqMarketProducts({ billingMethod: "spot" }).then((res) => {
      const originProducts = res.products;
      const products = originProducts.map((item: any) => {
        const nameInfo = item.productName.split(" ");
        const title1 = nameInfo[0];
        const title2 =
          item.productName.length > title1.length + 1
            ? item.productName.slice(title1.length + 1)
            : "";
        const memory = item.gpuMemory;
        const no = "1x";
        const price = (
          Math.round(Number(item.instancePrice.discount) / 1000) / 100
        ).toFixed(2);
        const no8 = "8x";
        const price8 = (
          Math.round((Number(item.instancePrice.discount) * 8) / 1000) / 100
        ).toFixed(2);

        // Add spot pricing if available
        let spotPrice = null;
        if (
          item.instanceSpotPrice &&
          Number(item.instanceSpotPrice.discount) > 0
        ) {
          spotPrice = (
            Math.round(Number(item.instanceSpotPrice.discount) / 1000) / 100
          ).toFixed(2);
        }

        return {
          title1,
          title2,
          memory,
          no,
          price,
          no8,
          price8,
          spotPrice,
        };
      });
      if (products.length >= 4) {
        setPrice1(products.slice(0, 2));
        setPrice2(products.slice(2, 4));
        setPricing2(products.slice(0, 4));
      } else {
        setPrice1(products.slice(0, 2));
        setPrice2(products.slice(2));
        setPricing2(products);
      }
    });
  }, []);
  return (
    <div className={`${styles.outContainer} pt-[92px] pb-[80px]`}>
      <Image
        src={"/gpu-instance/homepage/leftTopVector.svg"}
        alt="GPU Pricing Background"
        width={213}
        height={193}
        className={styles.leftTopVector}
      />
      <Image
        src={"/gpu-instance/homepage/rightBottomVector.svg"}
        alt="GPU Pricing Background"
        width={213}
        height={193}
        className={styles.rightBottomVector}
      />
      <div className={`max_width_container ${styles.container}`}>
        <div className={`flex flex-col items-center justify-center w-full`}>
          <div className={styles.top}>
            <div className={styles.topInner}>Save 50% on GPU costs</div>
          </div>
          <div className={`${styles.bottom} ${styles.webContainer}`}>
            <div className={styles.subContainer}>
              {price1.map((item, index) => (
                <GPUPricingCard priceInfo={item} key={index} />
              ))}
            </div>
            <div className={styles.subContainer}>
              {price2.map((item, index) => (
                <GPUPricingCard priceInfo={item} key={index} />
              ))}
            </div>
          </div>
          <div className={`${styles.bottom} ${styles.mobileContainer}`}>
            <Swiper
              modules={[Autoplay, Pagination, EffectCoverflow]}
              effect={"coverflow"}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={"auto"}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              loop={true}
              autoplay={{ delay: 2000, disableOnInteraction: false }}
              speed={1000}
              // slidesPerView={3}
              spaceBetween={8}
              pagination={{
                clickable: true,
              }}
              className={styles.swiper_wrap}
            >
              {pricing2.map((item: any, index: number) => (
                <SwiperSlide key={index} className={styles.slide}>
                  <GPUPricingCard priceInfo={item} key={index} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
}
