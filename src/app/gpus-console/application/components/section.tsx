"use client";

import { SearchInput } from "@/components/ui/input";
import {
  Check,
  LayoutGrid,
  Type,
  Image as ImageIcon,
  Mic,
  Video,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  reqGetApplicationTemplates,
  reqGetApplicationDetail,
} from "@/api/gpu-instance/application";
import styles from "./section.module.scss";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/standard/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { matchLogoForTemplate } from "@/lib/utils/utils";
import {
  reqCreateGpuInstance,
  reqGetProductMonthlyPricing,
} from "@/api/gpu-instance/explore";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { message } from "@/components/ui/standard/notify";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import TemplateDetail from "./templateDetail";
import { dealErrorByObj } from "@/lib/utils/dealError";
import ContentSkeletonDeep from "../../components/ContentSkeletonDeep";
import DataEmpty from "../../components/DataEmpty";
import CreateComplish from "./createComplish";
import Banner from "./banner";
import type { GpuBannerSlide } from "./gpuBannerMap";
import CommitmentFooter from "./CommitmentFooter";
import CommitmentOptions from "./CommitmentOptions";
import { SelectedCorner } from "./applicationUi";
import Image from "next/image";

function createTypeOptions() {
  return [
    {
      value: "all",
      text: "All Models",
      icon: (className: string) => (
        <LayoutGrid className={`w-4 h-4 ${className}`} />
      ),
    },
    {
      value: "llm",
      text: "LLM",
      icon: (className: string) => <Type className={`w-4 h-4 ${className}`} />,
    },
    {
      value: "image",
      text: "Image",
      icon: (className: string) => (
        <ImageIcon className={`w-4 h-4 ${className}`} />
      ),
    },
    {
      value: "audio",
      text: "Audio",
      icon: (className: string) => <Mic className={`w-4 h-4 ${className}`} />,
    },
    {
      value: "video",
      text: "Video",
      icon: (className: string) => <Video className={`w-4 h-4 ${className}`} />,
    },
  ];
}

export default function Section({
  gpuBannerSlides = [],
}: {
  gpuBannerSlides?: GpuBannerSlide[];
}) {
  const types = createTypeOptions();
  const [applicationList, setApplicationList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [currentApplication, setCurrentApplication] = useState<any>({});
  const [currentApplicationDetail, setCurrentApplicationDetail] = useState<any>(
    {},
  );
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId") ?? "";
  const [params, setParams] = useState<any>({
    page: 1,
    size: 12,
    llmType: "all",
    searchMsg: "",
  });
  const [initParams, setInitParams] = useState<any>({
    month: 1,
    billingMode: "onDemand",
    autoRenew: false,
    autoRenewMonth: "1",
    clusterId: "",
  });
  const [productInfo, setProductInfo] = useState<any>({});
  const [applicationDetailLoading, setApplicationDetailLoading] =
    useState(true);
  const applicationDetailAbortRef = useRef<AbortController | null>(null);

  const [monthlyPrice, setMonthlyPrice] = useState({
    endTime: "",
    instanceAmount: "",
    storageAmount: "",
    instanceMonthPrice: "",
    instanceMonthPricePrecision: 0,
    storagePrice: "",
    storagePricePricePrecision: 0,
    gpuNum: 0,
    storageSize: 0,
    month: 0,
  });

  function changeMonthlyPrice(value: any) {
    reqGetProductMonthlyPricing({
      productId: productInfo.productId,
      month: value || productInfo.monthlyPrice[0].month,
      gpuNum: Number(currentApplicationDetail?.recommendCard?.gpuNum || 0),
      // todo get storage size
      storageSize:
        Number(currentApplication?.rootfsSize) +
        Number(
          (
            currentApplication?.volumes?.find(
              (item: any) => item.type === "local",
            ) || { size: 0 }
          )?.size || 0,
        ),
    }).then((res: any) => {
      if (res) {
        setMonthlyPrice(res);
      }
    });
  }

  useEffect(() => {
    if (applicationId) {
      setDetailMode(true);
      setCurrentDetail({ Id: applicationId });
    } else {
      setDetailMode(false);
      setCurrentDetail({});
    }
  }, [applicationId]);

  const getApplicationDetail = useCallback(
    (item: any, templateId: string, configType: string) => {
      applicationDetailAbortRef.current?.abort();
      const ac = new AbortController();
      applicationDetailAbortRef.current = ac;

      setCurrentApplication(item);
      setApplicationDetailLoading(true);
      reqGetApplicationDetail({
        templateId,
        configType,
        signal: ac.signal,
      })
        .then((res: any) => {
          setCurrentApplicationDetail(res);

          if (res?.clusters?.length > 0) {
            setInitParams((prev: any) => ({
              ...prev,
              clusterId:
                res?.clusters?.length > 0 ? res?.clusters[0]?.clusterId : "",
              billingMode: "onDemand",
            }));
          }
          if (res?.product) {
            setProductInfo(res?.product);
          } else {
            setProductInfo({});
          }
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted) return;
          if (err instanceof DOMException && err.name === "AbortError") return;
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("reqGetApplicationDetail", err);
        })
        .finally(() => {
          if (applicationDetailAbortRef.current === ac) {
            setApplicationDetailLoading(false);
          }
        });
    },
    [],
  );

  const handleTemplateSearch = useCallback(
    (value: string) => {
      if (value.trim() !== params?.searchMsg?.trim()) {
        setParams({ ...params, searchMsg: value, page: 1 });
      }
    },
    [params],
  );

  useEffect(() => {
    const myParams =
      params.llmType === "all"
        ? {
            pageNum: params.page,
            pageSize: params.size,
            searchMsg: params.searchMsg?.trim(),
          }
        : {
            pageNum: params.page,
            pageSize: params.size,
            searchMsg: params.searchMsg?.trim(),
            applicationType: params.llmType,
          };
    setLoading(true);
    reqGetApplicationTemplates(myParams)
      .then((res: any) => {
        setApplicationList(res?.templates || []);
        setTotal(res?.total || 0);
        if (res?.templates?.length > 0) {
          getApplicationDetail(
            res?.templates[0],
            res?.templates[0].Id,
            res?.templates[0].enableApplicationInstance
              ? "instance"
              : "serverless",
          );
        } else {
          setCurrentApplication({});
          setCurrentApplicationDetail({});
          setProductInfo({});
          setApplicationDetailLoading(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    params.page,
    params.size,
    params.llmType,
    params.searchMsg,
    getApplicationDetail,
  ]);

  useEffect(() => {
    return () => {
      applicationDetailAbortRef.current?.abort();
      applicationDetailAbortRef.current = null;
    };
  }, []);

  const pathname = usePathname();
  const [path, setPath] = useState("");
  const dispatch = useAppDispatch();
  const { locale } = useI18n();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPath(
        encodeURIComponent(
          getLocalizedPath(`${pathname}${window.location.search}`, locale),
        ),
      );
    }
  }, [locale, pathname]);
  const userInfo = useAppSelector((state) => state.user);
  const router = useRouter();
  const [deployLoading, setDeployLoading] = useState(false);
  function deployApplication(billingMode: string) {
    if (!userInfo?.uuid) {
      message.error("Please login first");
      dispatch(setUserState(UserState.logout) as any);
      router.push(
        getLocalizedPath(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`, locale),
      );
      return;
    }
    const name = currentApplication?.name || "";
    const productId = productInfo.productId;
    const gpuNum = Number(currentApplicationDetail?.recommendCard?.gpuNum || 0);
    const envs = currentApplication?.envs || [];
    const command = currentApplication?.startCommand || "";
    const entrypoint = currentApplication?.entrypoint || "";
    const imageUrl = currentApplication?.image || "";

    const clusterId = initParams?.clusterId || "";

    const cudaVersion = currentApplication?.minCudaVersion || "";

    const ports: any[] = [];

    currentApplication?.ports?.forEach((item: any) => {
      item.ports.forEach((port: any) => {
        ports.push({
          type: item.type,
          port,
        });
      });
    });

    const imageAuthId = "";
    const rootfsSize = currentApplication?.rootfsSize || 0;

    const volumeMounts: any[] = [];
    const tools = currentApplication?.tools || [];
    const nodeId = "";
    const imageAuth = "";

    const params: any = {
      name,
      productId,
      gpuNum,
      envs,
      command,
      entrypoint,
      imageUrl,
      imageAuthId,
      rootfsSize,
      volumeMounts,
      tools,
      nodeId,
      imageAuth,
      clusterId,
      cudaVersion,
      billingMode,
      ports,
    };
    if (billingMode === "monthly") {
      params.month = initParams.month || 1;
      params.autoRenew = initParams.autoRenew || false;
      params.autoRenewMonth = Number(initParams.autoRenewMonth || 1);
    }
    setDeployLoading(true);
    reqCreateGpuInstance(params)
      .then((res: any) => {
        message.success("Deploy successfully");
        setShowCreateComplish({ showModal: true });
      })
      .catch((err: any) => {
        if (err?.reason === "INSUFFICIENT_RESOURCE") {
          if (billingMode === "spot") {
            message.error(
              "No available Spot instances in this region. Try On-Demand instead.",
            );
          } else {
            message.error("Insufficient resources");
          }
        }
        if (err?.reason === "CUDA_VERSION_INCOMPATIBLE") {
          message.error("CUDA version is incompatible");
        }
        if (err?.reason === "CREATE_GPU_NUM_LIMIT") {
          message.error(dealErrorByObj(err));
        }
      })
      .finally(() => {
        setDeployLoading(false);
      });
  }

  const [detailMode, setDetailMode] = useState<boolean>(false);
  const [currentDetail, setCurrentDetail] = useState<any>({});
  const [showCreateComplish, setShowCreateComplish] = useState<any>({
    showModal: false,
  });

  const sectionRootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = sectionRootRef.current;
    if (!root) return;

    if (detailMode) {
      root.style.removeProperty("--commitment-footer-h");
      return;
    }

    const apply = () => {
      const el = root.querySelector("[data-commitment-footer]");
      if (!el || !(el instanceof HTMLElement)) {
        root.style.setProperty("--commitment-footer-h", "70px");
        return;
      }
      const h = Math.ceil(el.getBoundingClientRect().height);
      root.style.setProperty("--commitment-footer-h", `${h}px`);
    };

    apply();
    const ro = new ResizeObserver(apply);
    const footerEl = root.querySelector("[data-commitment-footer]");
    if (footerEl instanceof HTMLElement) ro.observe(footerEl);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [
    detailMode,
    initParams.billingMode,
    initParams.autoRenew,
    initParams.month,
    productInfo?.productId,
  ]);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [serverlessCardFlipped, setServerlessCardFlipped] = useState(false);
  const serverlessFlipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearServerlessFlipTimer = () => {
    if (serverlessFlipTimerRef.current) {
      clearTimeout(serverlessFlipTimerRef.current);
      serverlessFlipTimerRef.current = null;
    }
  };

  useEffect(() => () => clearServerlessFlipTimer(), []);

  const handleServerlessCardClick = (e: MouseEvent) => {
    e.stopPropagation();
    if ((e.target as HTMLElement).closest("a")) {
      return;
    }
    if (serverlessCardFlipped) {
      clearServerlessFlipTimer();
      setServerlessCardFlipped(false);
      return;
    }
    clearServerlessFlipTimer();
    setServerlessCardFlipped(true);
    serverlessFlipTimerRef.current = setTimeout(() => {
      setServerlessCardFlipped(false);
      serverlessFlipTimerRef.current = null;
    }, 10_000);
  };

  const handleServerlessCardKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") {
      return;
    }
    e.preventDefault();
    if (serverlessCardFlipped) {
      clearServerlessFlipTimer();
      setServerlessCardFlipped(false);
      return;
    }
    clearServerlessFlipTimer();
    setServerlessCardFlipped(true);
    serverlessFlipTimerRef.current = setTimeout(() => {
      setServerlessCardFlipped(false);
      serverlessFlipTimerRef.current = null;
    }, 10_000);
  };

  const serverlessDeployTypeSharedTop = (
    <div className="flex flex-row items-center justify-between gap-3">
      <div className="flex flex-row items-center gap-3">
        <div className="w-8 h-8 rounded-[8px] bg-[var(--gray-3)] flex items-center justify-center">
          <Image
            src="/gpu-instance/application/icon-serverless.svg"
            alt="icon"
            width={16}
            height={16}
            className="w-4 h-4"
          />
        </div>
        <div className="font-h6 text-[var(--dark-3)]">{"Serverless"}</div>
      </div>
      <div className="font-h6 text-[var(--dark-1)]">{"Coming soon"}</div>
    </div>
  );

  return (
    <div
      ref={sectionRootRef}
      className={`${styles.section_root} ${detailMode ? styles.section_root_no_commitment_footer : ""}`}
    >
      {detailMode ? (
        <div className="mx-2">
          <div className="w-full">
            <TemplateDetail
              templateId={currentDetail.Id}
              deployApplication={(item: any) => {
                setDetailMode(false);
                getApplicationDetail(
                  item,
                  item.Id,
                  item.enableApplicationInstance ? "instance" : "serverless",
                );
                router.push(
                  getLocalizedPath(NOVITA_URL.GPU_CONSOLE_APPLICATION, locale),
                );
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="my-2">
            <div className="flex flex-col gap-6">
              {showBanner && gpuBannerSlides.length > 0 && (
                <Banner
                  items={gpuBannerSlides}
                  closeBanner={() => {
                    setShowBanner(false);
                  }}
                />
              )}
              <div>
                <div className="font-h5 text-[var(--black)] mb-2">
                  {"Deploy Application"}
                </div>
                <div className="font-menu text-[var(--dark-3-1)] mb-6">
                  {
                    "Select an application and configure GPU resources for deployment"
                  }
                </div>
                <div className="flex items-center mb-5">
                  <div className="w-[3px] h-[14px] bg-[var(--dark-1)] mr-2"></div>
                  <div className="font-h6 text-[var(--black)]">
                    {"Select Application"}
                  </div>
                </div>
                <div className="flex items-center flex-row justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    {types.map((type) => (
                      <div
                        onClick={() =>
                          setParams({ ...params, llmType: type.value, page: 1 })
                        }
                        key={type.text}
                        className={`flex items-center gap-[6px] cursor-pointer border-[1px] rounded-[6px] py-1 px-3 h-8 whitespace-nowrap
                    ${params.llmType === type.value ? "bg-[var(--gray-3)] border-[var(--dark-1)]" : "bg-[var(--white)] border-[var(--gray-2)]"}
                  `}
                      >
                        {typeof type.icon === "function"
                          ? type.icon(
                              params.llmType === type.value
                                ? "text-[var(--dark-1)]"
                                : "text-[var(--dark-2)]",
                            )
                          : type.icon}
                        <div
                          className={`font-subtle-medium ${params.llmType === type.value ? "text-[var(--black)]" : "text-[var(--dark-1)]"}`}
                        >
                          {type.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <SearchInput
                    className="w-[448px]"
                    placeholder={"Search templates..."}
                    onSearch={handleTemplateSearch}
                  />
                </div>
                <div className={styles.templates_container}>
                  {!loading &&
                    applicationList.map((item: any) => (
                      <div
                        className={`${styles.templates_item} 
                      ${currentApplication.Id === item.Id ? "!border-[1.5px] !border-[var(--dark-1)] !bg-[var(--gray-3)]" : ""}`}
                        key={item.Id}
                        onClick={() =>
                          getApplicationDetail(
                            item,
                            item.Id,
                            item.enableApplicationInstance
                              ? "instance"
                              : "serverless",
                          )
                        }
                      >
                        {currentApplication.Id === item.Id && (
                          <SelectedCorner />
                        )}
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 shrink-0 p-1 flex items-center justify-center bg-[var(--gray-3)] rounded-[8px]">
                              <Image
                                alt="icon"
                                width={24}
                                height={24}
                                src={matchLogoForTemplate(
                                  item?.logo,
                                  item?.image,
                                )}
                                className="w-[24px] h-[24px]"
                              />
                            </div>
                            <div
                              className={`flex items-center justify-center gap-1 px-[6px] py-[2px] ${currentApplication.Id === item.Id ? "bg-[var(--gray-4)]" : "bg-[var(--gray-3)]"} rounded-[4px]`}
                            >
                              <Image
                                src="/gpu-instance/application/card.svg"
                                alt="card"
                                width={12}
                                height={12}
                                className="w-3 h-3"
                              />
                              {item?.instanceApplicationConfig?.recommendCards
                                ?.length > 0 &&
                                item?.instanceApplicationConfig
                                  ?.recommendCards[0] && (
                                  <div
                                    className={styles.templates_item_type_text}
                                  >
                                    {`${item.instanceApplicationConfig.recommendCards[0]?.gpuName || ""} x ${item.instanceApplicationConfig.recommendCards[0]?.gpuNum}`}
                                  </div>
                                )}
                            </div>
                          </div>
                          <Button asChild variant="link" className="h-5">
                            <Link
                              href={getLocalizedPath(
                                `${NOVITA_URL.GPU_CONSOLE_APPLICATION}?applicationId=${encodeURIComponent(String(item.Id))}`,
                                locale,
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  getLocalizedPath(
                                    `${NOVITA_URL.GPU_CONSOLE_APPLICATION}?applicationId=${encodeURIComponent(String(item.Id))}`,
                                    locale,
                                  ),
                                );
                              }}
                              scroll
                            >
                              <span className="font-small-console text-[var(--brand-1)]">
                                {"View Details"}
                              </span>
                            </Link>
                          </Button>
                        </div>
                        <div className="font-h7 text-[var(--black)]">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2">
                          {Boolean(item.enableApplicationInstance) && (
                            <span className="px-[6px] rounded-[4px] bg-[var(--gray-4)] font-small-console text-[var(--dark-3-1)]">
                              {"Instance"}
                            </span>
                          )}
                          {Boolean(item.enableApplicationServerless) && (
                            <span className="px-[6px] rounded-[4px] bg-[var(--gray-4)] font-small-console text-[var(--dark-3-1)]">
                              {"Serverless"}
                            </span>
                          )}
                        </div>
                        <div className="font-small-console text-[var(--dark-3-1)]">
                          {item.image}
                        </div>
                      </div>
                    ))}
                </div>
                {!loading && total > params.size && (
                  <div>
                    <Pagination
                      total={total}
                      defaultCurrent={params.page}
                      pageSize={params.size}
                      onChange={(page) => {
                        setParams({ ...params, page: page });
                      }}
                    />
                  </div>
                )}
                {loading && (
                  <ContentSkeletonDeep
                    className="gap-[12px]"
                    itemHeight={134}
                  />
                )}
                {!loading && applicationList.length === 0 && <DataEmpty />}
              </div>
              <div>
                <div className="flex flex-row items-center gap-2 mb-3">
                  <div className="w-[3px] h-[14px] bg-[var(--dark-1)]"></div>
                  <div className="font-h6 text-[var(--black)]">
                    {"Select Deploy Type"}
                  </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                  <div
                    className="flex flex-col gap-3 cursor-pointer border-[2px] rounded-[8px] 
                p-4 border-[1px] border-[var(--dark-1)] bg-[var(--gray-3)] w-[50%] relative"
                  >
                    <SelectedCorner />
                    <div className="flex flex-row items-center gap-3">
                      <div className="w-8 h-8 rounded-[8px] bg-[var(--gray-4)] flex items-center justify-center">
                        <Image
                          src="/gpu-instance/application/icon-instance.svg"
                          alt="icon"
                          width={16}
                          height={16}
                          className="w-4 h-4 grayscale brightness-50"
                        />
                      </div>
                      <div className="font-h6 text-[var(--black)]">
                        {"Instance"}
                      </div>
                    </div>
                    <div className="font-subtle text-[var(--dark-2)]">
                      {
                        "Dedicated GPU instance with full control. Best for long-running workloads."
                      }
                    </div>
                    <div
                      className="w-full h-[1px] min-h-[1px] shrink-0 [background-image:repeating-linear-gradient(to_right,var(--dark-3)_0_3px,transparent_3px_6px)]"
                      aria-hidden
                    />
                    <div className="flex flex-row items-center gap-3">
                      <div className="flex items-end justify-center gap-1">
                        <Check className="w-[14px] h-[14px] text-[var(--dark-1)]" />
                        <div className="font-subtle text-[var(--dark-2)]">
                          {"SSH access"}
                        </div>
                      </div>
                      <div className="flex items-end justify-center gap-1">
                        <Check className="w-[14px] h-[14px] text-[var(--dark-1)]" />
                        <div className="font-subtle text-[var(--dark-2)]">
                          {"Persistent storage"}
                        </div>
                      </div>
                      <div className="flex items-end justify-center gap-1">
                        <Check className="w-[14px] h-[14px] text-[var(--dark-1)]" />
                        <div className="font-subtle text-[var(--dark-2)]">
                          {"Pay per hour"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-[50%]">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-pressed={serverlessCardFlipped}
                      onKeyDown={handleServerlessCardKeyDown}
                      onClick={handleServerlessCardClick}
                      className="relative w-full cursor-pointer overflow-hidden rounded-[8px] border-[2px] border-[var(--gray-2)] bg-[var(--white)]"
                    >
                      <div
                        className={`relative z-[1] flex w-full flex-col gap-3 p-4 transition-opacity duration-500 ease-in-out ${
                          serverlessCardFlipped
                            ? "pointer-events-none opacity-0"
                            : "opacity-100"
                        }`}
                      >
                        {serverlessDeployTypeSharedTop}
                        <div className="font-subtle text-[var(--dark-3)]">
                          {
                            "Auto-scaling GPU endpoints. Best for API services with variable traffic."
                          }
                        </div>
                        <div
                          className="w-full h-[1px] min-h-[1px] shrink-0 [background-image:repeating-linear-gradient(to_right,var(--dark-3)_0_3px,transparent_3px_6px)]"
                          aria-hidden
                        />
                        <div className="flex flex-row items-center gap-3">
                          <div className="flex items-end justify-center gap-1">
                            <Check className="w-[14px] h-[14px] text-[var(--dark-4)]" />
                            <div className="font-subtle text-[var(--dark-3)]">
                              {"Auto-scaling"}
                            </div>
                          </div>
                          <div className="flex items-end justify-center gap-1">
                            <Check className="w-[14px] h-[14px] text-[var(--dark-4)]" />
                            <div className="font-subtle text-[var(--dark-3)]">
                              {"No idle costs"}
                            </div>
                          </div>
                          <div className="flex items-end justify-center gap-1">
                            <Check className="w-[14px] h-[14px] text-[var(--dark-4)]" />
                            <div className="font-subtle text-[var(--dark-3)]">
                              {"Pay per request"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`absolute inset-0 z-[2] flex flex-col gap-3 p-4 transition-opacity duration-500 ease-in-out ${
                          serverlessCardFlipped
                            ? "opacity-100"
                            : "pointer-events-none opacity-0"
                        }`}
                      >
                        {serverlessDeployTypeSharedTop}
                        <p className="font-subtle">
                          Your serverless application is launching soon. <br />
                          Go to
                          <Button asChild variant="link" className="px-1 h-5">
                            <Link
                              href={getLocalizedPath(
                                NOVITA_URL.GPU_CONSOLE_SERVERLESS_DEPLOY,
                                locale,
                              )}
                              className="font-subtle text-[var(--brand-1)]"
                            >
                              Deploy Serverless
                            </Link>
                          </Button>
                          to view and manage it.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex p-4 items-center justify-between rounded-[8px] border-[1px] border-[var(--gray-2)] bg-[var(--gray-3)]">
                <div className="flex flex-col gap-1">
                  <div className="font-subtle-demibold text-[var(--black)]">
                    {"Currently selected"}
                  </div>
                  <div className="font-small-console text-[var(--dark-2)]">
                    {
                      "Based on the current selection, a random selection has been made for you to an available"
                    }
                  </div>
                </div>
                <div className="flex flex-row items-center gap-5">
                  <div className="shrink-0 flex flex-row items-center h-8 gap-4 px-4 rounded-[6px] py-[8px] bg-[var(--white)]">
                    <div className="shrink-0 flex flex-nowrap items-center gap-1">
                      <div className="shrink-0 font-menu-medium text-[var(--dark-3-1)]">
                        {"GPU Type"}
                      </div>
                      <div className="shrink-0 font-menu-medium text-[var(--dark-1)]">
                        {currentApplicationDetail?.recommendCard?.gpuName
                          ? `${currentApplicationDetail?.recommendCard?.gpuName} x ${currentApplicationDetail?.recommendCard?.gpuNum}`
                          : "--"}
                      </div>
                    </div>
                    <div className="w-[1px] h-3 bg-[var(--gray-2)]"></div>
                    <div className="flex flex-nowrap items-center gap-1">
                      <div className="shrink-0 font-menu-medium text-[var(--dark-3-1)]">
                        {"VRAM"}
                      </div>
                      <div className="shrink-0 font-menu-medium text-[var(--dark-1)]">
                        {`${currentApplicationDetail?.product?.gpuMemory || "-"}GB`}
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const hasClusters =
                      (currentApplicationDetail?.clusters?.length || 0) > 0;
                    const isInstanceType = Boolean(
                      currentApplication?.enableApplicationInstance,
                    );
                    const linkHref = isInstanceType
                      ? NOVITA_URL.GPU_CONSOLE_EXPLORE
                      : NOVITA_URL.GPU_CONSOLE_SERVERLESS_DEPLOY;
                    const linkLabel = isInstanceType
                      ? "INSTANCES → Deploy Instance"
                      : "SERVERLESS → Deploy Serverless";

                    if (!hasClusters && initParams.clusterId) {
                      setInitParams({ ...initParams, clusterId: "" });
                    }

                    const selectEl = (
                      <Select
                        value={initParams.clusterId}
                        onValueChange={(value) =>
                          setInitParams({ ...initParams, clusterId: value })
                        }
                        disabled={!hasClusters}
                      >
                        <SelectTrigger className="h-[36px] min-w-[150px]">
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentApplicationDetail?.clusters?.map(
                            (cluster: any) => (
                              <SelectItem
                                key={cluster.clusterId}
                                value={cluster.clusterId}
                              >
                                {cluster.clusterName}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    );

                    if (hasClusters) return selectEl;

                    return (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-block">{selectEl}</div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            sideOffset={8}
                            align="end"
                            className="max-w-xs text-sm"
                          >
                            <div className="space-y-2">
                              <p>
                                There aren&apos;t enough resources available
                                that meet the recommended requirements for this
                                application. Please go to{" "}
                                <Link
                                  href={getLocalizedPath(linkHref, locale)}
                                  className="font-bold underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {linkLabel}
                                </Link>{" "}
                                and create an instance using a different
                                configuration.
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })()}
                </div>
              </div>
              <CommitmentOptions
                applicationDetailLoading={applicationDetailLoading}
                currentApplication={currentApplication}
                productInfo={productInfo}
                initParams={initParams}
                setInitParams={setInitParams}
                changeMonthlyPrice={changeMonthlyPrice}
                sectionRoot={sectionRootRef.current}
              />
            </div>
            {showCreateComplish.showModal ? (
              <CreateComplish
                finishForm={() => setShowCreateComplish({ showModal: false })}
              />
            ) : (
              <></>
            )}
          </div>
          <CommitmentFooter
            state={{
              productInfo,
              applicationDetailLoading,
              initParams,
              monthlyPrice,
              currentApplication,
              currentApplicationDetail,
              deployLoading,
            }}
            actions={{
              deployApplication,
              setInitParams,
              changeMonthlyPrice,
            }}
          />
        </>
      )}
    </div>
  );
}
