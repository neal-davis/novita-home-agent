import invert from "lodash/invert";
import FUNCS, {
  FUNC_NAME,
  FUNC_TYPE,
  FUNC_TYPE_NAME,
  FUNC_DISPLAY_NAME,
  Main_Page_FUNCNAME,
  FuncData,
} from "@/app/models/constants/funcs";
import { setStorageWithExpiry, getStorageWithExpiry } from "@/lib/utils/utils";
import { NOVITA_URL } from "@/constants/urls";
import { funcFilter } from "./funcs";

export type FuncGroup = {
  title: string;
  list: FuncDataForProduct[];
};

export type FuncDataForProduct = {
  name: string;
  url: string;
  icon: string;
  displayName: string;
};

export function genProductItem(f: FuncData): FuncDataForProduct {
  return {
    name: f.name,
    url: f.url ?? NOVITA_URL.MODEL_LIBRARY_INDEX,
    icon: f.smallIcon,
    displayName: f.displayName,
  };
}

export function genFuncData(
  funcs?: Record<string, FuncData>,
): Record<string, FuncGroup> {
  const data: Record<string, FuncGroup> = {};
  Object.values(FUNC_TYPE)
    .filter((v) => {
      if (v === FUNC_TYPE.IMG) {
        return false;
      }
      return true;
    })
    .map((v) => {
      data[v.toString()] = {
        title: FUNC_TYPE_NAME[v],
        list: Object.values(funcs || FUNCS)
          .filter((f) => funcFilter(f, "product") && f.type === v)
          .map(genProductItem),
      };
    });
  return data;
}

export function getProductNameFromAPIName(apiName: string) {
  const apiMap = invert(FUNC_NAME);
  if (apiMap[apiName]) {
    return (
      FUNC_DISPLAY_NAME[apiMap[apiName] as keyof typeof FUNC_DISPLAY_NAME] || ""
    );
  }
  return "";
}

export function getProductNameFromAPINameInMainPage(apiName: string) {
  const apiMap = invert(FUNC_NAME);
  if (apiMap[apiName]) {
    return (
      Main_Page_FUNCNAME[apiMap[apiName] as keyof typeof Main_Page_FUNCNAME] ||
      ""
    );
  }
  return "";
}

const SPECIFY_MODEL_INFO = "SPECIFY_MODEL_INFO";

export function setSpecifyModelInfo(obj: Record<string, any>) {
  setStorageWithExpiry(SPECIFY_MODEL_INFO, obj, 10 * 60 * 1000);
}

export function getSpecifyModelInfo(): Promise<{ [key: string]: any }> {
  return getStorageWithExpiry(SPECIFY_MODEL_INFO);
}
