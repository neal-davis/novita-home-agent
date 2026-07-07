"use client";
import styles from "./addImagePrewarmJob.module.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { ProgressCircle } from "@/components/ui/standard/progress";
import { CascadeFilter } from "@/components/ui/standard/cascade-filter";
import Modal from "@/app/components/Modal/Modal";
import { reqAddGpuImagePrewarm } from "@/api/gpu-instance/images";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import ImageAuth from "../../settings/components/imageAuth";
// import { NOVITA_URL } from "@/constants/urls";
import { reqGpuStorageBaseInfo } from "@/api/gpu-instance/storage";
import { Button } from "@/components/ui/button";
import ChangeTemplateModal from "./changeTemplate";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SUPPORT_EMAIL_LINK } from "@/constants/urls";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { showPermissionMessage } from "@/lib/utils/permission";
import { SelectFilter } from "@/components/ui/standard/selectFilter";
import Image from "next/image";
const ADD_AUTH_OPTION_VALUE = "__add_authentication__";
export const CurrModal = Modal;
export default function AddImagePrewarmJob({
  finishForm,
  regionList,
  tooltipInfo,
  imageUrl,
}: {
  finishForm: any;
  regionList: any[];
  tooltipInfo: any;
  imageUrl?: string;
}) {
  const [params, setParams] = useState<any>({
    imageUrl: imageUrl || "",
    repositoryAuth: "",
    clusterId: "",
    productIds: [],
    note: "",
  });
  const [products, setProducts] = useState<any[]>([]);
  const [myAuths, setMyAuths] = useState<any>([]);
  const [regions, setRegions] = useState<any[]>(regionList);
  const [continents, setContinents] = useState<any[]>([]);
  useEffect(() => {
    reqGpuStorageBaseInfo({}).then((res) => {
      const regionsTmp = (res?.clusters || []).filter(
        (item: any) => item.version === "v2",
      );
      setRegions(regionsTmp);
      let continentsTmp = regionsTmp.map((item: any) => item.continent);
      continentsTmp = [...new Set(continentsTmp)];
      setContinents(continentsTmp);
    });
  }, []);
  useEffect(() => {
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
  }, []);
  const prevAbortController = useRef<AbortController | undefined>();
  const getProducts = useCallback(
    (clusterId: any) => {
      if (prevAbortController.current) {
        prevAbortController.current.abort("CanceledByUser");
      }
      const abortController = new AbortController();
      prevAbortController.current = abortController;
      setProductsLoading(true);
      reqMarketProducts(
        {
          cpuModel: "",
          memoryModel: "",
          cloudServiceType: "",
          cudaVersion: "",
          clusterId: clusterId && clusterId !== "-1" ? clusterId : undefined,
          storageId: "",
          auth: true,
          clusterIds:
            clusterId && clusterId !== "-1"
              ? [clusterId]
              : (regionList || []).map((item: any) => item.id),
        },
        abortController.signal,
      )
        .then((res: any) => {
          setProductsLoading(false);
          setProducts(res?.products || []);
          setParams((prev: any) => ({ ...prev, productIds: [] }));
        })
        .catch((e: any) => {
          // debugger;
          if (e !== "CanceledByUser") {
            setProductsLoading(false);
          }
        });
    },
    [regionList],
  );
  useEffect(() => {
    getProducts(params.clusterId);
  }, [getProducts, params.clusterId]);
  function inputChangeParamsInfo(item: string, value: any) {
    setParams({ ...params, [item]: value });
  }
  const [productsLoading, setProductsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  function addImagePrewarmJobFun() {
    if (isSubmitting) {
      return;
    }
    if (!params.imageUrl || !params.imageUrl.trim()) {
      message.error("Please enter the image address");
      return;
    }
    const ret = isValidDockerImageAddress(params.imageUrl.trim() || "");
    if (ret) {
      message.error(ret);
      return;
    }
    if (!params.clusterId || params.clusterId === "-1") {
      message.error("Please select the region");
      return;
    }
    if (!products.some((item: any) => item?.usableNode)) {
      message.error(
        "The GPU in the selected region is temporarily unavailable, please select other regions",
      );
      return;
    }
    if (params.note.trim().length > 100) {
      message.error("Remarks length cannot exceed 100 characters");
      return;
    }
    setIsSubmitting(true);
    reqAddGpuImagePrewarm({
      ...params,
      imageUrl: params.imageUrl.trim(),
      note: params.note.trim(),
      repositoryAuth:
        params.repositoryAuth === "-1" ? "" : params.repositoryAuth,
    })
      .then((res) => {
        setIsSubmitting(false);
        message.success("Operation successful");
        finishForm(true);
      })
      .catch(() => {
        setIsSubmitting(false);
      });
  }
  const hasContainerRegistryAuthAddPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.gpu_setting,
    resource: PERMISSION.RESOURCE.container_registry_auth,
    action: PERMISSION.ACTION.create,
  });
  const [showAddImageAuth, setShowAddImageAuth] = useState({
    showModal: false,
    authInfo: {},
  });
  function addImageAuthFun() {
    if (!hasContainerRegistryAuthAddPermission) {
      showPermissionMessage();
    } else {
      setShowAddImageAuth({ ...showAddImageAuth, showModal: true });
    }
  }
  function addModelValue(mark?: boolean, id?: string) {
    setShowAddImageAuth({ ...showAddImageAuth, showModal: false });
    if (mark && id) {
      setParams({ ...params, repositoryAuth: id });
    }
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
  }
  const [showChangeTemplate, setShowChangeTemplate] = useState({
    showModal: false,
  });
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.section}>
        <div>
          <div className={styles.funcDesc}>
            <div className="flex items-center gap-[6px] bg-[var(--gray-3)] p-[8px] rounded-[4px]">
              <ProgressCircle
                trailColor="var(--gray-1)"
                strokeColor="var(--brand-0)"
                percent={Math.round(
                  (tooltipInfo.total / tooltipInfo.limit) * 100,
                )}
                strokeWidth={3}
                size={15}
              />
              <div className="font-subtle">
                <span className="text-[var(--brand-0)]">
                  {tooltipInfo.total}
                </span>
                <span className="text-[var(--black)]">
                  /{tooltipInfo.limit}
                </span>
                <span className="ml-[4px] text-[var(--black)]">
                  Image prewarming tasks created, Each up to
                </span>
                <span className="ml-[4px] font-subtle-medium text-[var(--dark-1)]">
                  {tooltipInfo.perImageSize}GB
                </span>
              </div>
              <Tooltip
                title={
                  <div className="font-small-small text-[var(--dark-1)]">
                    <div>For additional tasks,</div>
                    <div>
                      Please{" "}
                      <Link
                        style={{
                          fontSize: "12px",
                          color: "var(--brand-0)",
                        }}
                        href={`mailto:${SUPPORT_EMAIL_LINK}`}
                        className={`py-[8px] hover:underline`}
                        target={"_blank"}
                      >
                        contact our technical support team.
                      </Link>
                    </div>
                  </div>
                }
              >
                <Image
                  src="/gpu-instance/images/help.svg"
                  alt="help"
                  width={16}
                  height={16}
                  className="w-[16px] h-[16px]"
                />
              </Tooltip>
            </div>
          </div>
          <div style={{ marginTop: "24px" }}>
            <div>
              <div className={styles.httpPortsTxt}>{"Container Image:"}</div>
              <div className="flex gap-[12px]">
                {/* <InputBase
  className={`${styles.httpPortsInput}`}
  onChange={(e: any) =>
    inputChangeParamsInfo("imageUrl", e.target.value)
  }
  value={params.imageUrl}
  style={{
    width: "calc(100% - 186px)",
    marginRight: "8px",
    height: "32px !important",
  }}
></InputBase> */}
                <div
                  style={{
                    width: "calc(100% - 140px)",
                    height: "32px",
                  }}
                  className={styles.inputContainer}
                >
                  <Input
                    className="hover:border-color-[var(--dark-1)]"
                    value={params.imageUrl}
                    style={{
                      height: "32px !important",
                    }}
                    onChange={(e: any) =>
                      inputChangeParamsInfo("imageUrl", e.target.value)
                    }
                  />
                </div>
                {/* <Input
  value={params.imageUrl}
  style={{
    width: "100%",
    height: "32px !important",
  }}
  onChange={(e: any) =>
    inputChangeParamsInfo("imageUrl", e.target.value)
  }
/> */}
                <Button
                  className="h-[32px] w-[128px]"
                  variant="outline"
                  onClick={() => {
                    setShowChangeTemplate({
                      ...showChangeTemplate,
                      showModal: true,
                    });
                  }}
                >
                  Select Template
                </Button>
              </div>
              <div className="font-small-console text-[var(--dark-2)] mt-1">
                You can enter an image address. Supports both private image
                repository addresses and Docker Hub image addresses, for
                example: novitalabs/tensorflow:2.7.0
              </div>
              {/* {httpError && (
    <div className={"ant-form-item-explain-error"}>{httpError}</div>
  )} */}
            </div>
            <div className="mt-[24px]">
              <div className={styles.tcpPortsTxt}>
                {"Container Registry Credentials"}
              </div>
              <SelectFilter
                {...{
                  value: params.repositoryAuth || "-1",
                  options: [
                    {
                      id: ADD_AUTH_OPTION_VALUE,
                      name: "Add Authentication",
                    },
                    ...myAuths,
                  ],
                  onValueChange: (value) => {
                    if (value === ADD_AUTH_OPTION_VALUE) {
                      addImageAuthFun();
                      return;
                    }
                    inputChangeParamsInfo("repositoryAuth", value);
                  },
                  onClear: () => inputChangeParamsInfo("repositoryAuth", "-1"),
                  allowClear:
                    !!params.repositoryAuth && params.repositoryAuth !== "-1",
                  // i18n-disable-next-line
                  clearAriaLabel: "Clear container registry credentials",
                  getOptionValue: (item: any) => item.id,
                  getOptionLabel: (item: any) => item.name,
                  renderTrigger: (item: any) => (
                    <span className="truncate text-left text-[14px] font-[350] leading-[14px] text-[var(--dark-1)]">
                      {params.repositoryAuth && params.repositoryAuth !== "-1"
                        ? item?.name || ""
                        : "Container Registry Credentials"}
                    </span>
                  ),
                  renderOption: (item: any) => item.name,
                  // i18n-disable-next-line
                  placeholder: "Container Registry Credentials",
                  triggerClassName: styles.selectItem,
                  // i18n-disable-next-line
                  contentClassName: "max-h-[450px]",
                  itemClassName: styles.menuItem,
                  showSearch: false,
                }}
              />
              {/* {tcpError && (
    <div className={"ant-form-item-explain-error"}>{tcpError}</div>
  )} */}
            </div>
            <div className={`mt-[24px] ${styles.cascader}`}>
              <div className={styles.tcpPortsTxt}>{"Region"}</div>
              <CascadeFilter<string, any>
                {...{
                  parents: continents,
                  childOptions: regions,
                  value: params.clusterId,
                  onValueChange: (value) => {
                    inputChangeParamsInfo("clusterId", value);
                  },
                  getParentValue: (continent) => continent,
                  getParentLabel: (continent) => continent,
                  getChildValue: (region) => region.id,
                  getChildLabel: (region) => region.name,
                  getChildParentValue: (region) => region.continent,
                  // i18n-disable-next-line
                  triggerClassName: "h-[32px] w-full",
                  // i18n-disable-next-line
                  placeholder: "Please select the region",
                }}
              />
              {/* {tcpError && (
    <div className={"ant-form-item-explain-error"}>{tcpError}</div>
  )} */}
            </div>
            <div className="mt-[24px]">
              <div className={styles.tcpPortsTxt}>{"GPU"}</div>
              <div className={styles.avaliableWrap}>
                <div>
                  <div className={styles.avaliableTitle}>{"Available"}</div>
                </div>
                <div className={styles.avaliable}>
                  {productsLoading ? (
                    <div className={styles.avaliableContent}>
                      {"Loading..."}
                    </div>
                  ) : (
                    products.map(
                      (item: any) =>
                        item?.usableNode && (
                          <Button
                            type="button"
                            variant="noborderghost"
                            key={item.productId}
                            className={`${
                              params.productIds.includes(item.productId)
                                ? styles.avaliableContentSelected
                                : styles.avaliableContent
                            }`}
                            onClick={() => {
                              if (params.productIds.includes(item.productId)) {
                                inputChangeParamsInfo(
                                  "productIds",
                                  params.productIds.filter(
                                    (productId: any) =>
                                      productId !== item.productId,
                                  ),
                                );
                              } else {
                                inputChangeParamsInfo("productIds", [
                                  ...params.productIds,
                                  item.productId,
                                ]);
                              }
                            }}
                          >
                            {item.productName}
                          </Button>
                        ),
                    )
                  )}
                </div>
              </div>
              <div
                className={`${styles.avaliableWrap} ${styles.unAvaliableWrap}`}
              >
                <div>
                  <div className={styles.unAvaliableTitle}>{"Unavailable"}</div>
                </div>
                <div className={styles.unAvaliable}>
                  {!productsLoading &&
                    products.map(
                      (item: any) =>
                        !item?.usableNode && (
                          <div
                            key={item.productId}
                            className={styles.unAvaliableContent}
                          >
                            {item.productName}
                          </div>
                        ),
                    )}
                </div>
              </div>
            </div>
            <div className="mt-[24px]">
              <div className={styles.tcpPortsTxt}>{"Remarks"}</div>
              {/* <InputBase
    className={styles.tcpPortsInput}
    onChange={(e: any) =>
      inputChangeParamsInfo("note", e.target.value)
    }
    value={params.note}
  ></InputBase> */}
              <div className={styles.inputContainer}>
                <Input
                  className="hover:border-color-[var(--dark-1)]"
                  value={params.note}
                  style={{
                    height: "32px !important",
                  }}
                  onChange={(e: any) =>
                    inputChangeParamsInfo("note", e.target.value)
                  }
                />
              </div>
              {/* {tcpError && (
    <div className={"ant-form-item-explain-error"}>{tcpError}</div>
  )} */}
            </div>
          </div>

          <div className={styles.btnContainer}>
            <Button
              className={styles.saveBtn}
              onClick={() => addImagePrewarmJobFun()}
              variant="default"
            >
              {!isSubmitting && (
                <span className={styles.saveBtnTxt}>{"Confirm Create"}</span>
              )}
              {isSubmitting && (
                <div className={styles.loadingWrap}>
                  <Image
                    alt="loading"
                    src="/gpu-instance/loading.gif"
                    width={24}
                    height={24}
                  />
                </div>
              )}
            </Button>
            <Button
              onClick={() => finishForm()}
              className={styles.cancelBtn}
              variant="default"
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </Button>
          </div>
        </div>
      </div>
      {showChangeTemplate.showModal ? (
        <ChangeTemplateModal
          open={showChangeTemplate.showModal}
          onClose={() => {
            setShowChangeTemplate({ ...showChangeTemplate, showModal: false });
          }}
          onConfirm={(template?: any) => {
            setParams({
              ...params,
              imageUrl: template.image,
              repositoryAuth: template.imageAuth,
            });
            setShowChangeTemplate({ ...showChangeTemplate, showModal: false });
          }}
        />
      ) : (
        ""
      )}
      {showAddImageAuth.showModal ? (
        <CurrModal
          footer={null}
          open={showAddImageAuth.showModal}
          title={"Add Credential"}
          onCancel={() =>
            setShowAddImageAuth({ ...showAddImageAuth, showModal: false })
          }
        >
          <ImageAuth
            authInfo={showAddImageAuth.authInfo}
            addModelValue={addModelValue}
          />
        </CurrModal>
      ) : (
        ""
      )}
    </div>
  );
}
