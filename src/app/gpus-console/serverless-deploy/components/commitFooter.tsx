"use client";
import styles from "./section.module.scss";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { CircleQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerlessContext } from "./Context";
import { useEffect, useRef, useState } from "react";
import { createEndpoint } from "@/api/gpu-instance/serverless";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { setUserState } from "@/store/slice/userSlice";
import { UserState } from "@/store/slice/userSlice";
import { NOVITA_URL } from "@/constants/urls";
import CreateComplish from "./createComplish";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { getGpuScrollContainer } from "../../utils/scroll";
export default function CommitFooter({
  product,
  gpuCount,
  createInstanceInfoParams,
  checkValid,
}: {
  product: any;
  gpuCount: number;
  createInstanceInfoParams: any;
  checkValid: () => string;
}) {
  const userInfo = useAppSelector((state) => state.user) || {};
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { locale } = useI18n();
  const path =
    usePathname() +
    (typeof window === "undefined"
      ? ""
      : encodeURIComponent((window as any)?.location?.search || ""));
  function isAuth() {
    if (!userInfo || !userInfo.uuid) {
      message.error("Please log in first");
      dispatch(setUserState(UserState.logout) as any);
      router.push(
        getLocalizedPath(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`, locale),
      );
      return false;
    } else {
      return true;
    }
  }
  const { storagePrice } = useServerlessContext();
  const price =
    product && gpuCount > 0
      ? (product.discount || product.price) * gpuCount
      : product
        ? product.discount || product.price
        : 0;
  const [deployLoading, setDeployLoading] = useState(false);
  function handleDeploy() {
    const err = checkValid();
    if (err) {
      message.error(err);
      return;
    }
    setDeployLoading(true);
    createEndpoint({
      productId: product?.id,
      ...createInstanceInfoParams,
    })
      .then((res) => {
        message.success("Deploy successfully");
        setShowCreateComplish(true);
      })
      .finally(() => {
        setDeployLoading(false);
      });
  }
  const [showCreateComplish, setShowCreateComplish] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const prevScrollbarWidth = useRef(-1);
  useEffect(() => {
    const scrollContainer = getGpuScrollContainer();
    if (!scrollContainer || !footerRef.current) return;
    const update = () => {
      const scrollbarWidth =
        scrollContainer.offsetWidth - scrollContainer.clientWidth;
      if (prevScrollbarWidth.current !== scrollbarWidth) {
        prevScrollbarWidth.current = scrollbarWidth;
        footerRef.current?.style.setProperty("right", `${scrollbarWidth}px`);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(scrollContainer);
    return () => ro.disconnect();
  }, []);
  return (
    <div
      ref={footerRef}
      className={styles.create_form_footer}
      data-commit-footer
    >
      <div className="flex flex-row items-center justify-end gap-4 w-full">
        <div className="flex flex-row items-center gap-1">
          <span className="font-body-medium text-[var(--black)]">
            {"Serverless Price:"}
          </span>
          <span className="font-h5 text-[var(--brand-1)]">
            {`$${price.toFixed(6)}`}
          </span>
          <span className="font-body-medium text-[var(--dark-2)]">
            {"/worker"}
          </span>
          <Tooltip
            title={
              "The price of each Worker, not per GPU. We charge for workers in running/starting state, and the billing is accurate to the second."
            }
          >
            <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
          </Tooltip>
        </div>
        <div className="w-[1px] h-[14px] bg-[var(--gray-1)]"></div>
        <div className="flex flex-row items-center gap-1">
          <span className="font-body-medium text-[var(--black)]">
            {"Storage price:"}
          </span>
          <span className="font-h5 text-[var(--brand-1)]">
            {`$${storagePrice}`}
          </span>
          <span className="font-body-medium text-[var(--dark-2)]">
            {"/GB/day"}
          </span>
          <Tooltip
            title={
              "The price of each Worker, not per GPU. We charge for workers in running/starting state, and the billing is accurate to the second."
            }
          >
            <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
          </Tooltip>
        </div>
        <Button
          disabled={deployLoading}
          onClick={() => {
            if (isAuth()) {
              handleDeploy();
            }
          }}
          variant="default"
          className="h-9 w-[200px]"
        >
          {"Deploy >"}
        </Button>
      </div>
      {showCreateComplish && (
        <CreateComplish finishForm={() => setShowCreateComplish(false)} />
      )}
    </div>
  );
}
