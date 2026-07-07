import Cookies from "js-cookie";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { dealSelectItem } from "./stepOneProductUtils";

export function hydrateMarketNodeProduct({
  selectItem,
  fallbackProduct,
  value,
  email,
  maxAvailableGpuNumber,
}: any) {
  if (maxAvailableGpuNumber) {
    selectItem.maxAvailableGpuNumber = maxAvailableGpuNumber;
  }
  if (
    selectItem &&
    selectItem.instancePrice &&
    (email === "xmo@berkeley.edu" || email === "yexiu@pplabs.org") &&
    selectItem.productName?.indexOf("H20") >= 0
  ) {
    selectItem.instancePrice.discount = "1000";
    selectItem.instancePrice.price = "1000";
  }
  selectItem.storagePrice =
    selectItem?.storagePrice || fallbackProduct.storagePrice;
  const productTmp = {
    availableGpuNumber: selectItem.availableGpuNumber,
    productName: selectItem.productName,
    selectedProductId: selectItem.productId,
    selectedGpuNum: Number(value),
    GpuNumOptions: [],
    cloudServiceType: selectItem.cloudServiceType,
    priceInfos: {
      instancePrice: {
        price: 0,
        discount: 0,
        dayPrice: 0,
        weekPrice: 0,
        monthPrice: 0,
        dayPriceOrigin: 0,
        weekPriceOrigin: 0,
        monthPriceOrigin: 0,
      },
      storagePrice: {
        price: 0,
        discount: 0,
        dayPrice: 0,
        weekPrice: 0,
        monthPrice: 0,
        dayPriceOrigin: 0,
        weekPriceOrigin: 0,
        monthPriceOrigin: 0,
      },
    },
    originDatas: [selectItem],
  };
  let resultArrTmp: any = [productTmp];
  resultArrTmp = dealSelectItem(
    productTmp.originDatas[0].productId,
    0,
    resultArrTmp,
  );
  resultArrTmp[0].selectedGpuNum = Number(value);
  return resultArrTmp[0];
}

export function fetchStepOneProducts({
  params,
  userId,
  rootFSSize,
  localVolumeSize,
  currentTemplate,
  userInfo,
  email,
  signal,
}: any) {
  const recommendCards: any = currentTemplate?.recommendCards || [];
  const recommendCardsArr: any = [];
  if (recommendCards && recommendCards.length > 0) {
    recommendCards.forEach((item: any) => {
      // recommendCardsArr.push(item.gpuSpecId + "-" + item.cardNum);
      recommendCardsArr.push(item.gpuSpecId + "-" + 1);
    });
  }
  return reqMarketProducts(
    {
      ...params,
      auth: Cookies.get("token") && (userInfo.uuid || userId),
      clusterId: params.clusterId === "-1" ? "" : params.clusterId,
      storageId: params.storageId === "-1" ? "" : params.storageId,
      cudaVersion: params.cudaVersion === "-1" ? "" : params.cudaVersion,
      rootFSSize: rootFSSize || 0,
      localVolumeSize: localVolumeSize || 0,
      recommendCards: recommendCardsArr.join(","),
    },
    signal,
  ).then((res) => {
    const originArr = res?.products || [];
    const resultArr: any = [];
    originArr.forEach((item: any) => {
      if (
        item &&
        item.instancePrice &&
        email === "xmo@berkeley.edu" &&
        item.productName?.indexOf("H20") >= 0
      ) {
        item.instancePrice.discount = "1000";
        item.instancePrice.price = "1000";
      }
      const selectItem = item;
      resultArr.push({
        availableGpuNumber: selectItem.availableGpuNumber,
        productName: item.productName,
        selectedProductId: selectItem.productId,
        selectedGpuNum: item.gpuNum || 1,
        GpuNumOptions: [],
        cloudServiceType: item.cloudServiceType,
        priceInfos: {
          instancePrice: {
            price: 0,
            discount: 0,
            dayPrice: 0,
            weekPrice: 0,
            monthPrice: 0,
            dayPriceOrigin: 0,
            weekPriceOrigin: 0,
            monthPriceOrigin: 0,
          },
          instanceSpotPrice: {
            price: 0,
            discount: 0,
            dayPrice: 0,
            weekPrice: 0,
            monthPrice: 0,
            dayPriceOrigin: 0,
            weekPriceOrigin: 0,
            monthPriceOrigin: 0,
          },
          storagePrice: {
            price: 0,
            discount: 0,
            dayPrice: 0,
            weekPrice: 0,
            monthPrice: 0,
            dayPriceOrigin: 0,
            weekPriceOrigin: 0,
            monthPriceOrigin: 0,
          },
        },
        originDatas: [item],
      });
    });
    let resultArrTmp: any = [...resultArr];
    for (let i = 0; i < resultArr.length; i++) {
      resultArrTmp = dealSelectItem(
        resultArr[i].originDatas[0].productId,
        i,
        resultArr,
      );
    }
    const recommendCardsTmp: any =
      currentTemplate?.recommendCards?.map((item: any) => item.gpuSpecId) || [];
    let usableNodeTmp = resultArrTmp.filter(
      (item: any) => item.originDatas[0].usableNode,
    );
    let unUsableNodeTmp = resultArrTmp.filter(
      (item: any) => !item.originDatas[0].usableNode,
    );
    usableNodeTmp = usableNodeTmp.sort((a: any, b: any) => {
      if (
        a.originDatas[0].activityProduct &&
        !b.originDatas[0].activityProduct
      ) {
        return -1;
      } else if (
        !a.originDatas[0].activityProduct &&
        b.originDatas[0].activityProduct
      ) {
        return 1;
      }
      if (a.originDatas[0].usableNode && !b.originDatas[0].usableNode) {
        return -1;
      } else if (
        recommendCardsTmp.includes(a.originDatas[0].gpuSpecId) &&
        !recommendCardsTmp.includes(b.originDatas[0].gpuSpecId)
      ) {
        return -1;
      }
    });
    unUsableNodeTmp = unUsableNodeTmp.sort((a: any, b: any) => {
      if (
        a.originDatas[0].activityProduct &&
        !b.originDatas[0].activityProduct
      ) {
        return -1;
      } else if (
        !a.originDatas[0].activityProduct &&
        b.originDatas[0].activityProduct
      ) {
        return 1;
      }
      if (a.originDatas[0].usableNode && !b.originDatas[0].usableNode) {
        return -1;
      } else if (
        recommendCardsTmp.includes(a.originDatas[0].gpuSpecId) &&
        !recommendCardsTmp.includes(b.originDatas[0].gpuSpecId)
      ) {
        return -1;
      }
    });
    const recommendCardsArrTmp: any = [];
    if (
      currentTemplate &&
      currentTemplate.recommendCards &&
      currentTemplate.recommendCards.length > 0
    ) {
      resultArrTmp.forEach((product: any) => {
        const recommendCard: any = currentTemplate.recommendCards.find(
          (item: any) => product.originDatas[0].gpuSpecId === item.gpuSpecId,
        );
        if (recommendCard) {
          if (Number(recommendCard.cardNum || 0) > 1) {
            recommendCardsArrTmp.push(
              `${product.productName} x ${recommendCard.cardNum}`,
            );
          } else {
            recommendCardsArrTmp.push(product.productName);
          }
        }
      });
    }
    return {
      products: [...usableNodeTmp, ...unUsableNodeTmp],
      recommendCardsShow: recommendCardsArrTmp,
    };
  });
}
