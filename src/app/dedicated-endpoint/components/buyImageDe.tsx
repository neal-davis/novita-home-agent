import Button from "@/app/components/button/Button";
import { cn } from "@/lib/utils";
import { PERMISSION } from "@/constants/constants";
import { NOVITA_URL } from "@/constants/urls";
import { usePermission } from "@/lib/hooks/usePermission";
import { showPermissionMessage } from "@/lib/utils/permission";
import { useAppSelector } from "@/store";
import localforage from "localforage";
import { nanoid } from "nanoid";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { DEProduct } from "./imgDeComponent";
import { SubmissionDialog } from "./imgDEDialog";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function BuyImageDeButton({
  product,
  count = 1,
  type = "primary",
  height = 44,
  className,
}: {
  product: DEProduct;
  count?: number;
  type?: "primary" | "secondary";
  height?: number;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useI18n();
  const businessPathname = getPathnameWithoutLocale(pathname);

  const rootPage =
    businessPathname === NOVITA_URL.PRICING ? "pricing" : "dedicated-endpoint";
  const proContactBtnId =
    rootPage === "pricing"
      ? CLICK_BTN_IDs.PRICING_BTNS.DEDICATED_ENDPOINT_IMG_VIDEO_PRO_CONTACT
      : CLICK_BTN_IDs.DEDICATED_ENDPOINT.IMG_VIDEO_PRO_CONTACT;
  const standardContactBtnId =
    rootPage === "pricing"
      ? CLICK_BTN_IDs.PRICING_BTNS.DEDICATED_ENDPOINT_IMG_VIDEO_STANDARD_CONTACT
      : CLICK_BTN_IDs.DEDICATED_ENDPOINT.IMG_VIDEO_STANDARD_CONTACT;
  const proBuyBtnId =
    rootPage === "pricing"
      ? CLICK_BTN_IDs.PRICING_BTNS.DEDICATED_ENDPOINT_IMG_VIDEO_PRO_BUY
      : CLICK_BTN_IDs.DEDICATED_ENDPOINT.IMG_VIDEO_PRO_BUY;
  const standardBuyBtnId =
    rootPage === "pricing"
      ? CLICK_BTN_IDs.PRICING_BTNS.DEDICATED_ENDPOINT_IMG_VIDEO_STANDARD_BUY
      : CLICK_BTN_IDs.DEDICATED_ENDPOINT.IMG_VIDEO_STANDARD_BUY;

  const uuid = useAppSelector((state) => state.user.uuid);
  const { isWhiteListUser } = useAppSelector(
    (state) => state.config.enterprise,
  );
  const hasDedicatedEndpointsSubscriptionPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.model_api,
    resource: PERMISSION.RESOURCE.dedicated_endpoints_subscribe,
    action: PERMISSION.ACTION.all,
  });
  const [openSubmission, setOpenSubmission] = useState(false);

  return (
    <>
      <Button
        type={type}
        height={height}
        className={cn(className)}
        onClick={() => {
          if (!uuid) {
            analytics.trackClick(
              product.name === "Pro" ? proContactBtnId : standardContactBtnId,
            );
            router.push(
              getLocalizedPath(
                `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(
                  getLocalizedPath(NOVITA_URL.DEDICATED_ENDPOINT, locale),
                )}`,
                locale,
              ),
            );
            return;
          }
          if (!hasDedicatedEndpointsSubscriptionPermission) {
            showPermissionMessage();
            return;
          }
          if (isWhiteListUser) {
            analytics.trackClick(
              product.name === "Pro" ? proBuyBtnId : standardBuyBtnId,
            );
            const oid = nanoid();
            localforage
              .setItem(oid, {
                plan_id: product.id,
                plan_name: product.name,
                count: count,
                price: product.price,
                base_price: product.origin_price,
                func_list: product.detail,
              })
              .then(() => {
                window.open(
                  getLocalizedPath(
                    `${NOVITA_URL.DEDICATED_ENDPOINT_ORDER}?oid=${oid}`,
                    locale,
                  ),
                  "_blank",
                );
              });
          } else {
            analytics.trackClick(
              product.name === "Pro" ? proContactBtnId : standardContactBtnId,
            );
            setOpenSubmission(true);
          }
        }}
      >
        {isWhiteListUser ? "Purchase" : "Contact Sales"}
      </Button>
      <SubmissionDialog
        open={openSubmission}
        setOpen={setOpenSubmission}
        plan_id={product.id}
      />
    </>
  );
}
