import { useEffect } from "react";
import { getUrlParams } from "./dealUrlParams";

export function useStepOneProductAutoDeploy({
  products,
  createInstanceInfo,
  deployFun,
}: any) {
  useEffect(() => {
    if (createInstanceInfo.initPg === 0) {
      const currentProductId = getUrlParams("productId");
      if (currentProductId) {
        const currentProduct = products?.find(
          (item: any) => item?.originDatas[0]?.productId === currentProductId,
        );
        if (currentProduct && currentProduct.originDatas[0].usableNode) {
          deployFun(currentProduct);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);
}
