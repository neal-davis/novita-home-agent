"use client";

import styles from "./item.module.scss";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { useResourcePackContext } from ".";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePathname, useRouter } from "next/navigation";
// import { NOVITA_URL } from "@/constants/urls";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { showPermissionMessage } from "@/lib/utils/permission";
import { formatTokens } from "@/lib/utils/format";
import { NOVITA_URL } from "@/constants/urls";
import { purchaseResourcePack, upgradeResourcePack } from "@/api/coding-plan";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ConfirmSubscriptionModal from "./ConfirmSubscriptionModal";

export default function Item({
  data,
  isFirstBuy,
  index,
  isReBuy,
  canBuy,
}: {
  data: any;
  isFirstBuy: boolean;
  index: number;
  isReBuy: boolean;
  canBuy: boolean;
}) {
  const hasResourcePackPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.resource_pack,
    action: PERMISSION.ACTION.all,
  });
  const { targetUrl, failTargetUrl, loading } = useResourcePackContext();
  const userInfo = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const path = usePathname() + encodeURIComponent(window.location.search);
  const router = useRouter();
  const [btnLoading, setBtnLoading] = useState(false);
  const resourcePackSpec: any = {
    billingCycle: data?.billingCycle || "cycle-based",
    packSpecId: Number(data?.id || 0),
    instanceId: isFirstBuy || isReBuy ? "" : data?.orderData?.instanceId || "",
    mode: isFirstBuy ? "firstBuy" : isReBuy ? "commonReBuy" : "upgrade",
    name: data?.name || "",
    tier: data?.tierInfo?.tier || "",
    quota: Number(data?.tierInfo?.quota || 0) / 10000,
    price: Number(data?.tierInfo?.price || 0) / 10000,
    purchasedPrice: Number(data?.orderData?.snapshotPrice || 0) / 10000,
    discount: Number(data?.tierInfo?.discountPrice || 0) / 10000,
  };
  if (
    isReBuy ||
    (resourcePackSpec.mode === "upgrade" && !data?.orderData?.isFirstOrder)
  ) {
    resourcePackSpec.discount = resourcePackSpec.price;
  }
  const labelText = (data?.deductRules || [])?.map(
    (item: any) => item.displayName,
  );
  const modelList = Array.from(new Set(labelText)) as string[];
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const purchaseResourcePackFunc = useCallback(() => {
    if (loading) {
      return;
    }
    if (
      resourcePackSpec.mode === "firstBuy" ||
      resourcePackSpec.mode === "commonReBuy"
    ) {
      {
        setBtnLoading(true);
        purchaseResourcePack({
          packSpecId: resourcePackSpec.packSpecId,
          returnUrl:
            targetUrl ||
            window.location.origin + window.location.pathname + "?purchased=1",
          successUrl:
            targetUrl ||
            window.location.origin + window.location.pathname + "?purchased=1",
          failedUrl:
            failTargetUrl || window.location.origin + window.location.pathname,
          tier: resourcePackSpec.tier,
        })
          .then((response: any) => {
            window.location.href = response.sessionUrl;
          })
          .finally(() => {
            setShowConfirmModal(false);
            setBtnLoading(false);
          });
      }
    } else if (resourcePackSpec.mode === "upgrade") {
      setBtnLoading(true);
      upgradeResourcePack({
        instanceId: resourcePackSpec.instanceId ?? "",
        returnUrl:
          targetUrl ||
          window.location.origin + window.location.pathname + "?purchased=1",
        successUrl:
          targetUrl ||
          window.location.origin + window.location.pathname + "?purchased=1",
        failedUrl:
          failTargetUrl || window.location.origin + window.location.pathname,
        newTier: resourcePackSpec.tier,
      })
        .then((response: any) => {
          window.location.href = response.sessionUrl;
        })
        .finally(() => {
          setBtnLoading(false);
          setShowConfirmModal(false);
        });
    }
  }, [
    loading,
    resourcePackSpec.mode,
    resourcePackSpec.packSpecId,
    resourcePackSpec.tier,
    resourcePackSpec.instanceId,
    targetUrl,
    failTargetUrl,
  ]);

  const discount: any = {
    Lite: "",
    Pro: "17%",
    Max: "33%",
  };

  const desc: any = useMemo(
    () => ({
      Lite: (requests: any) => [
        `- Performance up to ${requests} requests per minute`,
        "- Ideal for individual developers and daily coding tasks",
      ],
      Pro: (requests: any) => [
        `- Performance up to ${requests} requests per minute`,
        "- Designed for 2–5 person teams collaborating on development",
      ],
      Max: (requests: any) => [
        `- Performance up to ${requests} requests per minute`,
        "- Built for 10+ member teams or production environments",
      ],
    }),
    [],
  );
  const additionalInfo: any = useMemo(
    () => ({
      Lite: (tokens: any) => [
        `${tokens} Tokens`,
        '"All-in-one" model access covering a wide range of advanced LLMs',
        "No model restrictions — switch freely as needed and works seamlessly across multiple platforms.",
      ],
      Pro: (tokens: any) => [
        "Everything from Lite plus",
        "3X from lite token usage",
        `${tokens} Tokens`,
      ],
      Max: (tokens: any) => [
        "Everything from Pro plus",
        "15X from lite token usage",
        `${tokens} Tokens`,
      ],
    }),
    [],
  );
  const [isHoverDropdown, setIsHoverDropdown] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverContentRef = useRef<HTMLDivElement | null>(null);
  const openSinceRef = useRef<number>(0);
  const closedAtRef = useRef<number>(0);

  const OPEN_GRACE_MS = 220;
  const CLOSE_DELAY_MS = 280;
  const RECENT_CLOSE_MS = 400;

  const handleTriggerMouseEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!isHoverDropdown) {
      const now = Date.now();
      if (now - closedAtRef.current > RECENT_CLOSE_MS) {
        openSinceRef.current = now;
      } else {
        openSinceRef.current = 0;
      }
    }
    setIsHoverDropdown(true);
  }, [isHoverDropdown]);

  const handleTriggerMouseLeave = useCallback((e: React.MouseEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && popoverContentRef.current?.contains(next)) {
      return;
    }
    if (
      openSinceRef.current > 0 &&
      Date.now() - openSinceRef.current < OPEN_GRACE_MS
    ) {
      return;
    }
    closeTimerRef.current = setTimeout(() => {
      closedAtRef.current = Date.now();
      setIsHoverDropdown(false);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, []);

  const handleContentMouseEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsHoverDropdown(true);
  }, []);

  const handleContentMouseLeave = useCallback(() => {
    closedAtRef.current = Date.now();
    setIsHoverDropdown(false);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);
  const getAdditionalInfo = useCallback((): any[] => {
    const info = additionalInfo[data?.tierInfo?.tier || ""];
    if (info) {
      const result: any[] =
        (info.call(
          null,
          formatTokens(Math.round(Number(data?.tierInfo?.quota || 0) / 10000)),
        ) as any) || [];
      return result;
    }
    return [];
  }, [additionalInfo, data?.tierInfo?.tier, data?.tierInfo?.quota]);
  const getDesc = useCallback((): any[] => {
    const descInfo = desc[data?.tierInfo?.tier || ""];
    if (descInfo) {
      const result: any[] =
        (descInfo.call(null, data?.tierInfo?.rpm || "") as any[]) || [];
      return result;
    }
    return [];
  }, [desc, data?.tierInfo?.tier, data?.tierInfo?.rpm]);

  return (
    <div className={styles.item_container}>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-row justify-start items-center gap-[10px]">
          <div className={styles.tier_text}>
            <span className={styles.tier_text_content}>
              {data?.tierInfo?.tier || ""}
            </span>
          </div>
          {discount[data?.tierInfo?.tier || ""] && (
            <div className="font-subtle text-[var(--brand-1)]">
              {discount[data?.tierInfo?.tier || ""]
                ? `${discount[data?.tierInfo?.tier || ""]} discount`
                : ""}
            </div>
          )}
        </div>
        <div className="flex flex-row items-end gap-2">
          <span className="font-h3 text-[--black]">
            ${(data?.tierInfo?.discountPrice || 0) / 10000}
          </span>
          <span className="font-body text-[--black]">{"monthly"}</span>
        </div>
        <div className="font-subtle text-[--black]">
          {getDesc().map((item: any, index: number) => (
            <div key={index}>{item}</div>
          ))}
        </div>
        <div className="my-2 w-full">
          <div
            className={`${styles.subscribe_button} ${loading || !canBuy ? styles.btnLoading : ""}`}
            onClick={() => {
              if (loading || !canBuy) {
                return;
              }
              if (!userInfo || !userInfo.uuid) {
                const token: any = Cookies.get("token");
                if (token) {
                  message.error("Login expired, please login again");
                } else {
                  message.error("Please login first");
                }
                setTimeout(() => {
                  dispatch(setUserState(UserState.logout) as any);
                  localStorage.setItem("redirect", path);
                  if (
                    !localStorage.getItem("source") ||
                    localStorage.getItem("source") === "Direct"
                  ) {
                    localStorage.setItem("source", "coding-plan");
                  }
                  router.push(
                    `${NOVITA_URL.USER_LOGIN}?utm_source=coding-plan&redirect=${path}`,
                  );
                }, 3000);
                return true;
              }
              if (!hasResourcePackPermission) {
                showPermissionMessage();
                return;
              }
              if (canBuy) {
                if (
                  !isFirstBuy &&
                  !isReBuy &&
                  data.billingCycle === "decrement-based" &&
                  index > 0
                ) {
                  message.error(
                    "Decrement coding plan does not support upgrade subscription",
                  );
                  return;
                }
                setShowConfirmModal(true);
              } else {
                message.error(
                  "Subscription failed, the purchased coding plan is greater than or equal to this level",
                );
              }
            }}
          >
            <span className={styles.subscribe_button_text}>
              {data?.tierInfo?.tier === data?.orderData?.tier
                ? "Your Plan"
                : "Subscribe"}
            </span>
          </div>
        </div>
        <div className="h-[1px] w-full bg-[var(--gray-3)]"></div>
        <div className="flex flex-col gap-4 justify-start items-start">
          {getAdditionalInfo()?.map((item: any, index: number) => (
            <div
              key={index}
              className="flex flex-row justify-start items-start gap-2"
            >
              <div
                className="flex justify-center items-center 
              bg-[var(--brand-3)] rounded-full w-5 h-5"
              >
                <img
                  src="/coding-plan/support.svg"
                  alt="support"
                  className="w-[14px] h-[14px]"
                />
              </div>
              <div className="flex-1 font-subtle text-[--black]" key={index}>
                {item}
              </div>
            </div>
          ))}
        </div>

        {/* <div>
          <div className="flex flex-row align-start mb-2">
            <div className="flex items-center justify-center mr-2 h-[22px]">
              <span className="block w-1 h-1 bg-[var(--fill-2)] rounded-[50%]"></span>
            </div>
          </div>
          <div className="flex flex-row align-start">
            <div className="flex items-center justify-center mr-2 h-[22px]">
              <span className="block w-1 h-1 bg-[var(--fill-2)] rounded-[50%]"></span>
            </div>
            <div className="flex-1">
              <div className="font-subtle-medium text-[var(--dark-2)]">
                {formatTokens(
                  Math.round(Number(data?.tierInfo?.quota || 0) / 10000),
                ) + " tokens"}
              </div>
            </div>
          </div>
        </div> */}
      </div>
      <div className="w-full flex justify-center relative">
        <Popover
          open={isHoverDropdown}
          onOpenChange={(open) => {
            if (open) {
              setIsHoverDropdown(true);
            } else {
              setIsHoverDropdown(false);
            }
          }}
        >
          <PopoverTrigger asChild>
            <div
              className={`group inline-flex flex-row justify-start items-center gap-2 cursor-pointer 
              ${
                isHoverDropdown
                  ? "!text-[var(--brand-0)] !transition-colors !duration-300"
                  : "text-[var(--dark-3)]"
              }`}
              onMouseEnter={handleTriggerMouseEnter}
              onMouseLeave={handleTriggerMouseLeave}
            >
              <span className="font-subtle-medium">{"Model Access"}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform 
                duration-300 ${isHoverDropdown ? "rotate-180" : ""}`}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            className="min-w-[267px] px-3 py-2 bg-white rounded-lg"
          >
            <div
              ref={popoverContentRef}
              className="flex flex-col justify-center items-center gap-2"
              onMouseEnter={handleContentMouseEnter}
              onMouseLeave={handleContentMouseLeave}
            >
              {modelList.map((subItem: any, index: number) => (
                <div key={index} className="font-subtle text-[--black]">
                  {subItem}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <ConfirmSubscriptionModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        tierName={data?.tierInfo?.tier || ""}
        modelList={modelList}
        onConfirm={() => {
          purchaseResourcePackFunc();
        }}
        loading={btnLoading}
      />
    </div>
  );
}
