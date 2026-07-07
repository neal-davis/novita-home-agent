export function getContentByProductId(
  outObj: any,
  selectedProductId: any,
  contentName: any,
) {
  const selectedObj: any =
    outObj.originDatas.find(
      (itemStorage: any) => itemStorage.productId === selectedProductId,
    ) || {};
  if (selectedObj[contentName] !== undefined) {
    return selectedObj[contentName];
  } else {
    return "";
  }
}

export function getPriceByProductId(
  outObj: any,
  selectedProductId: any,
  mainName: any,
  contentName: any,
) {
  const selectedObj: any =
    outObj.originDatas.find(
      (itemStorage: any) => itemStorage.productId === selectedProductId,
    ) || {};
  if (
    selectedObj[mainName] &&
    selectedObj[mainName][contentName] !== undefined
  ) {
    return selectedObj[mainName][contentName];
  } else {
    return "";
  }
}

export function generateArray(num = 1) {
  if (num < 1) {
    num = 1;
  }
  const arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(i + 1);
  }
  return arr;
}

export function dealMoney(originPrice = 0, accuracy = 2, type?: string) {
  if (type === "ceil") {
    return (
      Math.ceil((originPrice / 100000) * Math.pow(10, accuracy)) /
      Math.pow(10, accuracy)
    );
  } else {
    return (
      Math.round((originPrice / 100000) * Math.pow(10, accuracy)) /
      Math.pow(10, accuracy)
    );
  }
}

export function dealPrice(sum: number, type?: string, numType?: string) {
  let param = 1;
  switch (type) {
    case "day":
      param = 24;
      break;
    case "week":
      param = 24 * 7;
      break;
    case "month":
      param = 24 * 30;
      break;
    default:
      param = 1;
      break;
  }
  return dealMoney(sum / param, 5, numType);
}

export function dealSelectItem(e: any, index: any, products: any) {
  const newProducts: any = [...products];
  newProducts[index].selectedProductId = e;
  // newProducts[index].selectedGpuNum = 1;
  const maxAvailableGpuNumber = getContentByProductId(
    newProducts[index],
    e,
    "maxAvailableGpuNumber",
  );
  newProducts[index].GpuNumOptions = generateArray(maxAvailableGpuNumber);
  const priceSpotTmp = getPriceByProductId(
    newProducts[index],
    e,
    "instanceSpotPrice",
    "price",
  );
  const discountSpotTmp = getPriceByProductId(
    newProducts[index],
    e,
    "instanceSpotPrice",
    "discount",
  );
  const priceTmp = getPriceByProductId(
    newProducts[index],
    e,
    "instancePrice",
    "price",
  );
  const discountTmp = getPriceByProductId(
    newProducts[index],
    e,
    "instancePrice",
    "discount",
  );
  const dayPriceTmp = getPriceByProductId(
    newProducts[index],
    e,
    "instancePrice",
    "dayPrice",
  );
  const weekPriceTmp = getPriceByProductId(
    newProducts[index],
    e,
    "instancePrice",
    "weekPrice",
  );
  const monthPriceTmp = getPriceByProductId(
    newProducts[index],
    e,
    "instancePrice",
    "monthPrice",
  );
  const priceSpot = isNaN(Number(priceSpotTmp))
    ? priceSpotTmp
    : dealPrice(Number(priceSpotTmp), "", "");
  const discountSpot = isNaN(Number(discountSpotTmp))
    ? discountSpotTmp
    : dealPrice(Number(discountSpotTmp), "", "");
  const price = isNaN(Number(priceTmp))
    ? priceTmp
    : dealPrice(Number(priceTmp), "", "");
  const discount = isNaN(Number(discountTmp))
    ? discountTmp
    : dealPrice(Number(discountTmp), "", "");
  const dayPrice = isNaN(Number(dayPriceTmp))
    ? dayPriceTmp
    : dealPrice(Number(dayPriceTmp), "day", "");
  const weekPrice = isNaN(Number(weekPriceTmp))
    ? weekPriceTmp
    : dealPrice(Number(weekPriceTmp), "week", "");
  const monthPrice = isNaN(Number(monthPriceTmp))
    ? monthPriceTmp
    : dealPrice(Number(monthPriceTmp), "month", "");
  const spriceTmp = getPriceByProductId(
    newProducts[index],
    e,
    "storagePrice",
    "price",
  );
  const sdiscountTmp = getPriceByProductId(
    newProducts[index],
    e,
    "storagePrice",
    "discount",
  );
  const sdayPriceTmp = getPriceByProductId(
    newProducts[index],
    e,
    "storagePrice",
    "dayPrice",
  );
  const sweekPriceTmp = getPriceByProductId(
    newProducts[index],
    e,
    "storagePrice",
    "weekPrice",
  );
  const smonthPriceTmp = getPriceByProductId(
    newProducts[index],
    e,
    "storagePrice",
    "monthPrice",
  );
  const sprice = isNaN(Number(spriceTmp))
    ? spriceTmp
    : dealPrice(Number(spriceTmp), "", "");
  const sdayPrice = isNaN(Number(sdayPriceTmp))
    ? sdayPriceTmp
    : dealPrice(Number(sdayPriceTmp), "day", "");
  const sweekPrice = isNaN(Number(sweekPriceTmp))
    ? sweekPriceTmp
    : dealPrice(Number(sweekPriceTmp), "week", "");
  const smonthPrice = isNaN(Number(smonthPriceTmp))
    ? smonthPriceTmp
    : dealPrice(Number(smonthPriceTmp), "month", "");
  const priceInfos = {
    instancePrice: {
      price,
      discount,
      dayPrice,
      weekPrice,
      monthPrice,
      dayPriceOrigin: dealMoney(Number(dayPriceTmp), 2),
      weekPriceOrigin: dealMoney(Number(weekPriceTmp), 2),
      monthPriceOrigin: dealMoney(Number(monthPriceTmp), 2),
    },
    instanceSpotPrice: {
      price: priceSpot,
      discount: discountSpot,
      dayPrice,
      weekPrice,
      monthPrice,
      dayPriceOrigin: dealMoney(Number(dayPriceTmp), 2),
      weekPriceOrigin: dealMoney(Number(weekPriceTmp), 2),
      monthPriceOrigin: dealMoney(Number(monthPriceTmp), 2),
    },
    storagePrice: {
      price: sprice,
      discount: dealMoney(Number(sdiscountTmp), 3),
      dayPrice: sdayPrice,
      weekPrice: sweekPrice,
      monthPrice: smonthPrice,
      dayPriceOrigin: dealMoney(Number(sdayPriceTmp), 3),
      weekPriceOrigin: dealMoney(Number(sweekPriceTmp), 3),
      monthPriceOrigin: dealMoney(Number(smonthPriceTmp), 3),
    },
  };
  newProducts[index].priceInfos = priceInfos;
  return newProducts;
}
