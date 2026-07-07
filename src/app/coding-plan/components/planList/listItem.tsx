"use client";

import { Button } from "@/components/ui/button";
import styles from "./listItem.module.scss";
import Item from "./item";
import { useEffect, useState } from "react";

export default function ListItem({
  itemData,
  isReBuy,
  orderData,
}: {
  itemData: any;
  isReBuy: boolean;
  orderData: any;
}) {
  const [orderIndex, setOrderIndex] = useState(-1);

  useEffect(() => {
    setOrderIndex(
      orderData.length <= 0 || !orderData[0]?.instanceId
        ? -1
        : itemData?.tierList?.findIndex(
            (item: any) => item.tier === orderData[0]?.tier,
          ),
    );
  }, [itemData?.tierList, orderData]);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.item_container}>
          {itemData?.tierList?.map((item: any, index: number) => (
            <Item
              data={{
                ...itemData,
                billingCycle: itemData?.billingCycle,
                tierInfo: item,
                orderData:
                  orderData.length > 0
                    ? orderData[0]
                    : { instanceId: null, pkgSpecsId: null },
              }}
              key={index}
              isFirstBuy={orderIndex === -1}
              index={index}
              isReBuy={isReBuy}
              canBuy={isReBuy || index > orderIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
