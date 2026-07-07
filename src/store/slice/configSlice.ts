import Cookies from "js-cookie";
import { queryEnterpriseConfig } from "@/api/enterprise";
import { queryUserDiscount } from "@/api/user";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getBatchPrice } from "@/api/price";
import {
  ModelProductPriceSchema,
  MODEL_API_PRODUCT_IDS,
} from "@/constants/price";
import { dealMoneyWithPrecision } from "@/lib/utils/money";

export const LS_KEY_HIDE_NOTICE = "hide_notice";

export const DISABLE_NOTICE_URLS = ["/models/llm/", "/referral"];

export type CampaignBannerItem = {
  badgeText: string;
  headingPart1: string;
  headingPart2: string;
  description: string;
  buttonText: string;
  buttonHref: string;
};

export const fetchEnterprise = createAsyncThunk(
  "config/fetchEnterprise",
  async () => {
    try {
      const response = await queryEnterpriseConfig();
      return {
        isWhiteListUser: response?.isWhiteListUser || false,
        isEnterprisePlan: response?.isEnterprisePlan || false,
        playgroundAPIConfig: response?.playgroundAPIConfig,
        billingMethod: response?.billingMethod,
      };
    } catch (error) {
      console.log(error);
    }
  },
);

export const fetchUserDiscount = createAsyncThunk(
  "config/fetchUserDiscount",
  async () => {
    try {
      const response = await queryUserDiscount();
      return response;
    } catch (error) {
      console.log(error);
    }
  },
);

export const fetchModelProductPrice = createAsyncThunk(
  "config/fetchModelProductPrice",
  async () => {
    try {
      const response = await getBatchPrice({
        businessType: "model_api",
        productIds: MODEL_API_PRODUCT_IDS as unknown as string[],
      });
      return response.reduce((acc: ModelProductPriceSchema, curr) => {
        acc[curr.productId as keyof ModelProductPriceSchema] = {
          originalPrice: dealMoneyWithPrecision(
            curr.basePrice0,
            curr.pricePrecision,
            4,
          ),
          discountPrice: dealMoneyWithPrecision(
            curr.discountPrice0,
            curr.pricePrecision,
            4,
          ),
        };
        return acc;
      }, {});
    } catch (error) {
      console.log(error);
      return {};
    }
  },
);

/**
 * Process batch price API response into ModelProductPriceSchema format
 */
export function processPriceResponse(response: any[]): ModelProductPriceSchema {
  return response.reduce((acc: ModelProductPriceSchema, curr) => {
    const originalPrice = dealMoneyWithPrecision(
      curr.basePrice0,
      curr.pricePrecision,
      4,
    );
    const discountPrice =
      curr.discountPrice0 !== undefined
        ? dealMoneyWithPrecision(curr.discountPrice0, curr.pricePrecision, 4)
        : undefined;

    if (
      discountPrice !== undefined &&
      typeof discountPrice === "number" &&
      typeof originalPrice === "number" &&
      discountPrice < originalPrice
    ) {
      acc[curr.productId as keyof ModelProductPriceSchema] = {
        originalPrice,
        discountPrice,
      };
    } else {
      acc[curr.productId as keyof ModelProductPriceSchema] = {
        originalPrice,
        discountPrice: originalPrice,
      };
    }
    return acc;
  }, {});
}

type ConfigStateType = {
  isMobile: boolean;
  locale: string;
  title: string;
  keyImg: Record<string, string>;
  modelRole: boolean;
  paymethods: string[];
  isReg: boolean;
  enterprise: {
    isWhiteListUser: boolean;
    isEnterprisePlan?: boolean;
    playgroundAPIConfig?: string;
    billingMethod: number;
  };
  showLoginModal: boolean;
  loginModalType: string;
  discount: {
    couponId: string;
    percentOff: number;
    amountOff: number;
    redeemBy: number;
    valid: boolean;
  };
  notice: {
    show: boolean;
    showInConsole: boolean;
    name: string;
    content: string;
    url: string;
    updatedAt: string;
    height: number;
  };
  infoDialog: {
    title: string;
    description: string;
    confirmRedirect: string;
    emphasisContent: string;
  };
  openCollect: boolean;
  permissionsConfig: Record<
    string,
    {
      action: string;
      resource_group: string;
      resource: string;
      scope?: string;
    }[]
  >;
  campaign: Campaign | null;
  codingPlanCampaign: Campaign | null;
  modelProductPrice: ModelProductPriceSchema;
  serverTimestamp: number; // Server timestamp in milliseconds for campaign validation
  campaignConfig: {
    homeCampaignBanner?: CampaignBannerItem[];
    consoleCampaignBanner?: CampaignBannerItem[];
  };
};

export const configSlice = createSlice({
  name: "config",
  initialState: {
    isMobile: false,
    locale: "",
    title: "",
    keyImg: {},
    modelRole: false,
    paymethods: [],
    isReg: false,
    enterprise: {
      isWhiteListUser: false,
      isEnterprisePlan: false,
      playgroundAPIConfig: "",
      billingMethod: 1,
    },
    showLoginModal: false,
    loginModalType: "log-in",
    discount: {
      couponId: "",
      percentOff: 0,
      amountOff: 0,
      redeemBy: 0,
      valid: false,
    },
    notice: {
      show: false,
      showInConsole: false,
      name: "",
      content: "",
      url: "",
      updatedAt: "",
      height: 50,
    },
    infoDialog: {
      title: "",
      description: "",
      confirmRedirect: "",
      emphasisContent: "",
    },
    openCollect: false,
    permissionsConfig: {},
    campaign: null,
    codingPlanCampaign: null,
    modelProductPrice: {},
    serverTimestamp: 0,
    campaignConfig: {},
  } as ConfigStateType,
  reducers: {
    setIsMobile(state, action) {
      state.isMobile = action.payload;
    },
    setLocale(state, action) {
      state.locale = action.payload;
    },
    setConfigTitle(state, action) {
      state.title = action.payload;
    },
    setImgKey(state, action) {
      const data = action.payload;
      if (data.key && data.value) {
        state.keyImg[data.key] = data.value;
      }
    },
    setModelRole(state, action) {
      state.modelRole = action.payload;
    },
    setPaymethods(state, action) {
      state.paymethods = action.payload;
    },
    setIsReg(state, action) {
      state.isReg = action.payload;
    },
    setEnterprise(state, action) {
      state.enterprise = action.payload;
    },
    setShowLoginModal(state, action) {
      state.showLoginModal = action.payload;
    },
    setLoginModalType(state, action) {
      state.loginModalType = action.payload;
    },
    closeNotice(state) {
      state.notice.show = false;
    },
    closeNoticeForever(state) {
      state.notice.show = false;
      Cookies.set(
        LS_KEY_HIDE_NOTICE,
        new Date(state.notice.updatedAt).getTime().toString(),
      );
    },
    setInfoDialog(state, action) {
      state.infoDialog = action.payload;
    },
    closeInfoDialog(state) {
      state.infoDialog.title = "";
      state.infoDialog.description = "";
      state.infoDialog.confirmRedirect = "";
      state.infoDialog.emphasisContent = "";
    },
    setOpenCollect(state, action) {
      state.openCollect = action.payload;
    },
    setModelProductPrice(state, action) {
      state.modelProductPrice = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEnterprise.fulfilled, (state, action) => {
      state.enterprise = action.payload || {
        isWhiteListUser: false,
        isEnterprisePlan: false,
        playgroundAPIConfig: "",
        billingMethod: 1,
      };
    });
    builder.addCase(fetchUserDiscount.fulfilled, (state, action) => {
      state.discount = action.payload;
    });
    builder.addCase(fetchModelProductPrice.fulfilled, (state, action) => {
      state.modelProductPrice = action.payload;
    });
  },
});

export const selectResourceStructure = (state: {
  config: ConfigStateType;
}): Record<string, string[]> => {
  const ownerPermission = state.config.permissionsConfig.owner;
  if (!ownerPermission) {
    return {};
  }
  const resources = ownerPermission.reduce(
    (acc, curr) => {
      const { resource_group, resource } = curr;

      if (!acc[resource_group]) {
        acc[resource_group] = [];
      }

      if (!acc[resource_group].includes(resource)) {
        acc[resource_group].push(resource);
      }

      return acc;
    },
    {} as Record<string, string[]>,
  );

  if (resources.billing) {
    const billingOrder = [
      "balance",
      "vouchers",
      "transactions",
      "details",
      "dedicated_endpoints_info",
      "warning",
      "budget",
      "payment_method",
      "recharge",
      "auto_recharge",
      "overview",
    ];

    resources.billing.sort((a, b) => {
      const aIndex = billingOrder.indexOf(a);
      const bIndex = billingOrder.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      if (aIndex !== -1) {
        return -1;
      }

      if (bIndex !== -1) {
        return 1;
      }

      return a.localeCompare(b);
    });
  }

  return resources;
};

export const {
  setIsMobile,
  setLocale,
  setConfigTitle,
  setImgKey,
  setModelRole,
  setPaymethods,
  setIsReg,
  setEnterprise,
  setShowLoginModal,
  setLoginModalType,
  closeNotice,
  closeNoticeForever,
  setInfoDialog,
  closeInfoDialog,
  setOpenCollect,
  setModelProductPrice,
} = configSlice.actions;
