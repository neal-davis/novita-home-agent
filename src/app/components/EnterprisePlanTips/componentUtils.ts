import EventEmitter from "eventemitter3";
import { queryEnterpriseConfig } from "@/api/enterprise";
import { setStorageWithExpiry, getStorageWithExpiry } from "@/lib/utils/utils";
import { ENTERPRISE_PLAYGROUND_CONFIG } from "@/constants/constants";

export const CONTAINER_HEIGHT = 168;
export const CONTAINER_WIDTH = 298;

export type Iposition = {
  x: number;
  y: number;
};

type IEnterpriseInfo = {
  isWhiteListUser: boolean;
  isEnterprisePlan?: boolean;
  playgroundAPIConfig?: string;
} | null;

const SHOW_ENTERPRISE_PLAN_TIPS = Symbol("SHOW_ENTERPRISE_PLAN_TIPS");
const ENTERPRISE_REMIND_LATER = "ENTERPRISE_REMIND_LATER";
const SHOULD_REFRESH_ENTERPRISE_INFO = "SHOULD_REFRESH_ENTERPRISE_INFO";

class Utils extends EventEmitter {
  private enterpriseInfo: IEnterpriseInfo = null;

  private tipPosition: Iposition = { x: 0, y: 0 };

  public updateEnterpriseInfo(info: IEnterpriseInfo) {
    this.enterpriseInfo = info;
  }

  public isUseEnterprise(): boolean {
    const config = this.enterpriseInfo?.playgroundAPIConfig || "";
    return config === ENTERPRISE_PLAYGROUND_CONFIG.USE_ENTERPRISE;
  }

  public async checkTipsVisible(): Promise<boolean> {
    const generateBtn =
      document.querySelector("#btn-playground-generate") ||
      document.querySelector("#btn-product-generate");
    let config = "";
    if (this.getShouldRefreshEnterpriseInfo()) {
      const res = await queryEnterpriseConfig();
      this.updateEnterpriseInfo({
        isWhiteListUser: res?.isWhiteListUser || false,
        isEnterprisePlan: res?.isEnterprisePlan || false,
        playgroundAPIConfig: res?.playground_api_config,
      });
      config = res?.playground_api_config;
    } else {
      config = this.enterpriseInfo?.playgroundAPIConfig || "";
    }

    // not initial
    if (!generateBtn || !this.enterpriseInfo) {
      return false;
    }
    // not enterprisePlan user
    if (!this.enterpriseInfo.isEnterprisePlan) {
      return false;
    }
    // later
    if (getStorageWithExpiry(ENTERPRISE_REMIND_LATER)) {
      return false;
    }

    // playground_api_config not set
    if (
      config !== ENTERPRISE_PLAYGROUND_CONFIG.NOT_USE_ENTERPRISE &&
      config !== ENTERPRISE_PLAYGROUND_CONFIG.USE_ENTERPRISE
    ) {
      const bbox = generateBtn.getBoundingClientRect();
      this.tipPosition = {
        x: (bbox.x * 2 + bbox.width) / 2 - CONTAINER_WIDTH / 2,
        y: bbox.y - CONTAINER_HEIGHT - 24 + document.documentElement.scrollTop,
      };
      this.emitTipsVisible();
      return true;
    }
    return false;
  }

  public setRemindLater() {
    setStorageWithExpiry(ENTERPRISE_REMIND_LATER, "1", 7 * 24 * 60 * 60 * 1000);
  }

  private getShouldRefreshEnterpriseInfo() {
    const flag = localStorage.getItem(SHOULD_REFRESH_ENTERPRISE_INFO);
    if (flag) {
      localStorage.removeItem(SHOULD_REFRESH_ENTERPRISE_INFO);
      return true;
    }
    return false;
  }

  public setShouldRefreshEnterpriseInfo() {
    localStorage.setItem(SHOULD_REFRESH_ENTERPRISE_INFO, "1");
  }

  public addTipsSubscription(fn: (bbox: Iposition) => void) {
    this.on(SHOW_ENTERPRISE_PLAN_TIPS, () => {
      fn(this.tipPosition);
    });
  }

  public deleteSubscription() {
    this.removeAllListeners(SHOW_ENTERPRISE_PLAN_TIPS);
  }

  private emitTipsVisible() {
    this.emit(SHOW_ENTERPRISE_PLAN_TIPS);
  }
}

const utils = new Utils();
export default utils;
