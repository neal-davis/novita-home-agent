"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import {
  reqMarketQueryOptions,
  reqGetMarketNode,
} from "@/api/gpu-instance/explore";
import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import {
  reqAddTemplate,
  reqGetTemplates,
  reqGetOfficialTemplates,
} from "@/api/gpu-instance/templates";
import { usePathname, useRouter } from "next/navigation";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/store";
import { getUrlParams } from "./dealUrlParams";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import debounce from "lodash/debounce";
import { useI18n } from "@/i18n/provider";
import StepOneView, { StepOneViewProps } from "./StepOneView";
import {
  fetchStepOneProducts,
  hydrateMarketNodeProduct,
} from "./stepOneProductData";
import { useStepOneInitialData } from "./useStepOneInitialData";
import { useStepOneDerivedOptions } from "./useStepOneDerivedOptions";
import { useStepOneProductAutoDeploy } from "./useStepOneProductAutoDeploy";
import { getRootLocalSize } from "./stepOneOptions";
import {
  handleCreateMyTemplate,
  handleOpenCreateNetworkVolume,
  handleSubmitRequest,
} from "./stepOneActions";
import { useEncodedPath } from "./useEncodedPath";
const NO_FILTER_OPTION_VALUE = "-1";

function getTemplateCudaVersion(template?: any) {
  return template?.minCudaVersion || NO_FILTER_OPTION_VALUE;
}

const StepOne = ({
  emitDataFun,
  createInstanceInfoOut,
}: {
  emitDataFun: any;
  createInstanceInfoOut: any;
}) => {
  const userInfo = useAppSelector((state) => state.user);
  const hasTemplateReadPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.template,
    resource: PERMISSION.RESOURCE.template,
    action: PERMISSION.ACTION.read,
  });
  const hasStorageReadPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.storage,
    resource: PERMISSION.RESOURCE.storage,
    action: PERMISSION.ACTION.read,
  });
  const hasTemplateCreatePermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.template,
    resource: PERMISSION.RESOURCE.template,
    action: PERMISSION.ACTION.create,
  });
  const hasStorageCreatePermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.storage,
    resource: PERMISSION.RESOURCE.storage,
    action: PERMISSION.ACTION.create,
  });
  const [createInstanceInfo, setCreateInstanceInfo] = useState({
    ...createInstanceInfoOut,
    clusterId: createInstanceInfoOut.clusterId
      ? createInstanceInfoOut.clusterId
      : NO_FILTER_OPTION_VALUE,
    cudaVersion: createInstanceInfoOut.cudaVersion
      ? createInstanceInfoOut.cudaVersion
      : NO_FILTER_OPTION_VALUE,
  });
  const [filters, setFilters] = useState({
    clusters: [],
    cpuModels: [],
    memoryModels: [],
    cudaVersions: [],
  });
  const [products, setProducts] = useState<any>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [templateListOfficial, setTemplateListOfficial] = useState([]);
  const [templateListPrivate, setTemplateListPrivate] = useState([]);
  const [officialTemplates, setOfficialTemplates] = useState<any>({});
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const path = useEncodedPath(pathname);
  const dispatch = useAppDispatch();
  const email = useAppSelector((state) => state.user.email);
  const spotUrlParams = getUrlParams("spot");
  const [dataInit, setDataInit] = useState(false);
  useStepOneProductAutoDeploy({ products, createInstanceInfo, deployFun });
  function initFilterProducts(
    createInstanceInfoOutTmp: any,
    userId?: any,
    template?: any,
  ) {
    reqMarketQueryOptions({ auth: userInfo?.uuid || "" }).then((res: any) => {
      const cpuModels = res?.cpuModels || filters.cpuModels;
      const memoryModels = res?.memoryModels || filters.memoryModels;
      const clusters = res?.clusters || filters.clusters;
      const cudaVersions = res?.cudaVersions || filters.cudaVersions;
      setFilters({ clusters, cpuModels, memoryModels, cudaVersions });
      let cpuModelTmp = params.cpuModel;
      let clusterIdTmp: any = getUrlParams("clusterId");
      if (!clusterIdTmp) {
        clusterIdTmp = createInstanceInfoOutTmp.clusterId
          ? createInstanceInfoOutTmp.clusterId
          : NO_FILTER_OPTION_VALUE;
        if (
          clusterIdTmp === NO_FILTER_OPTION_VALUE &&
          template?.clusterIds?.length > 0
        ) {
          clusterIdTmp = template?.clusterIds[0];
        }
      }
      if (cpuModels.length) {
        cpuModelTmp = cpuModels[0];
      }
      let memoryModelTmp = params.memoryModel;
      if (memoryModels.length) {
        memoryModelTmp = memoryModels[0];
      }
      setParams({
        ...params,
        clusterId: clusterIdTmp,
        cpuModel: cpuModelTmp,
        memoryModel: memoryModelTmp,
        cudaVersion: getTemplateCudaVersion(createInstanceInfoOutTmp?.imageObj),
        rootFSSize:
          createInstanceInfoOutTmp?.imageObj?.rootfsSize ||
          createInstanceInfoOutTmp?.rootfsSize ||
          0,
      });
      const [rootFSSize, localVolumeSize] = getRootLocalSize(template);
      getListData(
        {
          ...params,
          clusterId: clusterIdTmp,
          cpuModel: cpuModelTmp,
          memoryModel: memoryModelTmp,
          cudaVersion: getTemplateCudaVersion(
            createInstanceInfoOutTmp?.imageObj,
          ),
        },
        userId,
        rootFSSize,
        localVolumeSize,
        template,
      );
    });
  }
  const prevAbortController = useRef<AbortController | undefined>();
  function getListData(
    params: any,
    userId?: any,
    rootFSSize?: any,
    localVolumeSize?: any,
    currentTemplate?: any,
  ) {
    if (prevAbortController.current) {
      prevAbortController.current.abort("CanceledByUser");
    }
    const abortController = new AbortController();
    prevAbortController.current = abortController;
    setProductsLoading(true);
    fetchStepOneProducts({
      params,
      userId,
      rootFSSize,
      localVolumeSize,
      currentTemplate,
      userInfo,
      email,
      signal: abortController.signal,
    })
      .then(({ products, recommendCardsShow }) => {
        if (!dataInit) {
          setDataInit(true);
        }
        setProducts(products);
        setRecommendCardsShow(recommendCardsShow);
        setProductsLoading(false);
        setDeployObj({
          ...deployObj,
          productId: null,
          currProduct: null,
          gpuNum: 1,
        });
      })
      .catch(() => {
        setProductsLoading(false);
      });
  }
  const [params, setParams] = useState({
    clusterId: "-1",
    cpuModel: "",
    memoryModel: "",
    cudaVersion: "-1",
    storageId: "-1",
    cloudServiceType: "",
    billingMethod: spotUrlParams === "1" ? "spot" : "onDemand",
    rootFSSize: 0,
  });
  const [myStorages, setMyStorages] = useState<any>([]);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  useStepOneInitialData({
    email,
    params,
    createInstanceInfo,
    userInfo,
    spotUrlParams,
    filters,
    hasStorageReadPermission,
    hasTemplateReadPermission,
    setCreateInstanceInfo,
    setParams,
    setTemplateListOfficial,
    setOfficialTemplates,
    setTemplateListPrivate,
    setMyStorages,
    initFilterProducts,
  });
  function inputSetParamsText(item: string, e: any, valueType = "") {
    const paramsTmp: any = { ...params };
    paramsTmp[item] = valueType === "value" ? e : e.target.value;
    if (
      item === "rootFSSize" &&
      (Number(paramsTmp.rootFSSize) < 0 ||
        Number(paramsTmp.rootFSSize) > 100000)
    ) {
      return;
    }
    setParams({
      ...paramsTmp,
      storageId: item === "clusterId" ? "-1" : paramsTmp.storageId,
    });
    if (item === "clusterId") {
      setCreateInstanceInfo({
        ...createInstanceInfo,
        storageId: "",
        storageName: "",
        volumeMounts: [{ type: "local", id: "", size: 0, mountPath: "" }],
        productId: null,
        currProduct: null,
        gpuNum: 1,
      });
      emitDataFun(
        {
          ...createInstanceInfo,
          storageId: "",
          storageName: "",
          volumeMounts: [{ type: "local", id: "", size: 0, mountPath: "" }],
          productId: null,
          currProduct: null,
          gpuNum: 1,
        },
        false,
      );
    } else if (item !== "rootFSSize") {
      setCreateInstanceInfo({
        ...createInstanceInfo,
        productId: null,
        currProduct: null,
        gpuNum: 1,
      });
      emitDataFun(
        {
          ...createInstanceInfo,
          productId: null,
          currProduct: null,
          gpuNum: 1,
        },
        false,
      );
    }
    const [rootFSSize, localVolumeSize] = getRootLocalSize(
      createInstanceInfo?.imageObj,
    );
    if (item === "rootFSSize") {
      debouncedInput(
        {
          ...paramsTmp,
          storageId: paramsTmp.storageId,
        },
        null,
        paramsTmp.rootFSSize || rootFSSize,
        localVolumeSize,
        createInstanceInfo?.imageObj,
      );
    } else {
      getListData(
        {
          ...paramsTmp,
          storageId: item === "clusterId" ? "-1" : paramsTmp.storageId,
        },
        null,
        paramsTmp.rootFSSize || rootFSSize,
        localVolumeSize,
        createInstanceInfo?.imageObj,
      );
    }
  }
  function changeImageTemplate(templateType: string, value: any) {
    const createInstanceInfoTmp = { ...createInstanceInfo };
    switch (templateType) {
      case "official":
        createInstanceInfoTmp.templateType = "official";
        createInstanceInfoTmp.templateId = value;
        createInstanceInfoTmp.imageObj =
          templateListOfficial.find((item: any) => item.Id === value) || {};
        break;
      case "private":
        createInstanceInfoTmp.templateType = "private";
        createInstanceInfoTmp.templateId = value;
        createInstanceInfoTmp.imageObj =
          templateListPrivate.find((item: any) => item.Id === value) || {};
        break;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("templateId", value);
    }
    setCreateInstanceInfo({
      ...createInstanceInfoTmp,
      productId: null,
      currProduct: null,
      gpuNum: 1,
    });
    emitDataFun(
      {
        ...createInstanceInfoTmp,
        productId: null,
        currProduct: null,
        gpuNum: 1,
      },
      false,
    );
    const [rootFSSize, localVolumeSize] = getRootLocalSize(
      createInstanceInfoTmp?.imageObj,
    );
    const cudaVersion = getTemplateCudaVersion(createInstanceInfoTmp?.imageObj);
    setParams({
      ...params,
      rootFSSize,
      cudaVersion,
      clusterId:
        createInstanceInfoTmp?.imageObj?.clusterIds?.length > 0
          ? createInstanceInfoTmp?.imageObj?.clusterIds[0]
          : params.clusterId,
    });
    getListData(
      {
        ...params,
        rootFSSize,
        cudaVersion,
        clusterId:
          createInstanceInfoTmp?.imageObj?.clusterIds?.length > 0
            ? createInstanceInfoTmp?.imageObj?.clusterIds[0]
            : params.clusterId,
      },
      null,
      rootFSSize,
      localVolumeSize,
      createInstanceInfoTmp?.imageObj,
    );
  }
  function changePrivateTemplate(e: any) {
    const officialTemplatesTmp = { ...officialTemplates };
    const keys: any = Object.keys(officialTemplates);
    if (keys) {
      keys.forEach((item: any) => {
        officialTemplatesTmp[item] = false;
      });
    }
    setOfficialTemplates(officialTemplatesTmp);
    if (e.target.value !== "-1") {
      changeImageTemplate("private", e.target.value);
    } else {
      setCreateInstanceInfo({
        ...createInstanceInfo,
        templateType: "",
        templateId: "",
        imageObj: null,
        productId: null,
        currProduct: null,
        gpuNum: 1,
      });
      emitDataFun(
        {
          ...createInstanceInfo,
          templateType: "",
          templateId: "",
          imageObj: null,
          productId: null,
          currProduct: null,
          gpuNum: 1,
        },
        false,
      );
      getListData(params);
    }
  }
  const [showReadMe, setShowReadMe] = useState({
    showModal: false,
    readMe: "",
  });
  function closeReadMe() {
    setShowReadMe({ ...showReadMe, showModal: false });
  }
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  function addTemplate(mark: boolean, template?: any) {
    if (!mark) {
      setShowCreateTemplateModal(false);
    } else {
      if (template) {
        reqAddTemplate({ template }).then((response) => {
          message.success("success");
          reqGetTemplates({
            channels: ["private"],
            isMyCommunity: true,
          }).then((res: any) => {
            setTemplateListPrivate(res?.template || []);
            const createInstanceInfoTmp = { ...createInstanceInfo };
            changeImageTemplate("private", response?.templateId);
            createInstanceInfoTmp.templateType = "private";
            createInstanceInfoTmp.templateId = response?.templateId;
            createInstanceInfoTmp.imageObj =
              (res?.template || []).find(
                (item: any) => item.Id === response?.templateId,
              ) || {};
            setCreateInstanceInfo(createInstanceInfoTmp);
          });
          setShowCreateTemplateModal(false);
        });
      }
    }
  }
  const updateList = (templateId: any) => {
    reqGetTemplates({
      channels: ["private"],
      isMyCommunity: true,
    }).then((res: any) => {
      setTemplateListPrivate(res?.template || []);
      const createInstanceInfoTmp = { ...createInstanceInfo };
      const officialTemplatesTmp = { ...officialTemplates };
      const keys: any = Object.keys(officialTemplates);
      if (keys) {
        keys.forEach((item: any) => {
          officialTemplatesTmp[item] = false;
        });
      }
      setOfficialTemplates(officialTemplatesTmp);
      createInstanceInfoTmp.templateType = "private";
      createInstanceInfoTmp.templateId = templateId;
      createInstanceInfoTmp.imageObj =
        (res?.template || []).find((item: any) => item.Id === templateId) || {};
      if (typeof window !== "undefined") {
        localStorage.setItem("templateId", templateId);
      }
      setCreateInstanceInfo({
        ...createInstanceInfoTmp,
        productId: null,
        currProduct: null,
        gpuNum: 1,
      });
      emitDataFun(
        {
          ...createInstanceInfoTmp,
          productId: null,
          currProduct: null,
          gpuNum: 1,
        },
        false,
      );
      const [rootFSSize, localVolumeSize] = getRootLocalSize(
        createInstanceInfoTmp?.imageObj,
      );
      const cudaVersion = getTemplateCudaVersion(
        createInstanceInfoTmp?.imageObj,
      );
      if (createInstanceInfoTmp?.imageObj?.clusterIds?.length > 0) {
        setParams({
          ...params,
          rootFSSize,
          clusterId:
            createInstanceInfoTmp?.imageObj?.clusterIds[0] || params.clusterId,
          cudaVersion,
        });
        getListData(
          {
            ...params,
            clusterId:
              createInstanceInfoTmp?.imageObj?.clusterIds[0] ||
              params.clusterId,
            cudaVersion,
          },
          null,
          rootFSSize,
          localVolumeSize,
          createInstanceInfoTmp?.imageObj,
        );
      } else {
        setParams({
          ...params,
          rootFSSize,
          cudaVersion,
        });
        getListData(
          {
            ...params,
            cudaVersion,
          },
          null,
          rootFSSize,
          localVolumeSize,
          createInstanceInfoTmp?.imageObj,
        );
      }
    });
    setShowCreateTemplateModal(false);
  };
  function createMyTemplate() {
    handleCreateMyTemplate({
      userInfo,
      dispatch,
      router,
      path,
      locale,
      hasTemplateCreatePermission,
      setShowCreateTemplateModal,
    });
  }
  function changeOfficialTemplateCheck(id: any, checked: boolean) {
    const officialTemplatesTmp = { ...officialTemplates };
    const keys: any = Object.keys(officialTemplates);
    if (keys) {
      keys.forEach((item: any) => {
        if (item === id) {
          officialTemplatesTmp[item] = checked;
        } else {
          officialTemplatesTmp[item] = false;
        }
      });
    }
    setOfficialTemplates(officialTemplatesTmp);
    if (checked) {
      changeImageTemplate("official", id);
    } else {
      setCreateInstanceInfo({
        ...createInstanceInfo,
        templateType: "",
        templateId: "",
        imageObj: null,
        productId: null,
        currProduct: null,
        gpuNum: 1,
      });
      emitDataFun(
        {
          ...createInstanceInfo,
          templateType: "",
          templateId: "",
          imageObj: null,
          productId: null,
          currProduct: null,
          gpuNum: 1,
        },
        false,
      );
      getListData(params);
    }
  }
  const [deployObj, setDeployObj] = useState<any>({});
  function deployFun(currProduct: any) {
    const createInstanceInfoTmp = { ...createInstanceInfo };
    createInstanceInfoTmp.productId = currProduct.selectedProductId;
    createInstanceInfoTmp.priceInfos = currProduct.priceInfos;
    createInstanceInfoTmp.currProduct = currProduct.originDatas[0];
    createInstanceInfoTmp.GpuNumOptions = currProduct.GpuNumOptions;
    createInstanceInfoTmp.gpuNum = 1;
    const imageObj = createInstanceInfoTmp.imageObj;
    if (imageObj.recommendCards) {
      createInstanceInfoTmp.recommendCards = imageObj.recommendCards;
      if (imageObj.recommendCards.length > 0) {
        const gpuSpecId = imageObj.recommendCards[0]?.gpuSpecId || "xx";
        const cardNum = Number(imageObj.recommendCards[0]?.cardNum) || 1;
        const isRecommend =
          currProduct.originDatas[0].gpuSpecId === gpuSpecId ? 1 : 0;
        if (
          isRecommend &&
          cardNum <= currProduct.originDatas[0].maxAvailableGpuNumber
        ) {
          createInstanceInfoTmp.gpuNum = cardNum;
        }
      }
    }
    const val: any = { ...createInstanceInfo };
    val.productId = currProduct.selectedProductId;
    val.priceInfos = currProduct.priceInfos;
    val.currProduct = currProduct.originDatas[0];
    val.GpuNumOptions = currProduct.GpuNumOptions;
    val.gpuNum = createInstanceInfoTmp.gpuNum;
    val.imageUrl = val?.imageObj?.image;
    val.imageID = val?.imageObj?.Id;
    val.billingMethods = currProduct.billingMethods;
    val.clusterId = params.clusterId === "-1" ? undefined : params.clusterId;
    val.cudaVersion =
      params.cudaVersion === "-1" ? undefined : params.cudaVersion;
    const netDisk: any = myStorages?.find(
      (item: any) => item.storageId === createInstanceInfoTmp.storageId,
    );
    val.storageName = netDisk?.storageName || "";
    val.filterRootFSSize = params.rootFSSize;
    const value = createInstanceInfoTmp.gpuNum;
    const [rootFSSize, localVolumeSize] = getRootLocalSize(
      createInstanceInfoTmp?.imageObj,
    );
    let productsTmp: any = createInstanceInfoTmp?.currProduct || {};
    reqGetMarketNode({
      ...params,
      auth: Cookies.get("token") && userInfo.uuid,
      clusterId: params.clusterId === "-1" ? "" : params.clusterId,
      storageId: params.storageId === "-1" ? "" : params.storageId,
      cudaVersion: params.cudaVersion === "-1" ? "" : params.cudaVersion,
      gpuNum: Number(value),
      productId: productsTmp.productId,
      rootFSSize,
      localVolumeSize,
    }).then((res: any) => {
      productsTmp = hydrateMarketNodeProduct({
        selectItem: res.product,
        fallbackProduct: productsTmp,
        value,
        email,
        maxAvailableGpuNumber:
          currProduct?.originDatas[0]?.maxAvailableGpuNumber || 1,
      });
      setCreateInstanceInfo({
        ...createInstanceInfoTmp,
        currProduct: productsTmp.originDatas[0],
        gpuNum: Number(value),
      });
      setDeployObj({
        ...val,
        currProduct: productsTmp.originDatas[0],
        gpuNum: Number(value),
      });
      emitDataFun({
        ...val,
        currProduct: productsTmp.originDatas[0],
        gpuNum: Number(value),
      });
      const timeroutHandler = setTimeout(() => {
        if (typeof document !== "undefined") {
          document.querySelector(".choose-gpu-num-slider")?.scrollIntoView({
            behavior: "smooth",
          });
        }

        if (timeroutHandler) {
          clearTimeout(timeroutHandler);
        }
      }, 200);
    });
  }
  function submitRequest(productName: any, gpuNum: any) {
    handleSubmitRequest({
      productName,
      gpuNum,
      userInfo,
      dispatch,
      router,
      path,
      locale,
    });
  }
  const finishOper = (operMark: any, info: any) => {
    if (info) {
      setMyStorages([{ ...info }, ...myStorages]);
      const createInstanceInfoTmp = { ...createInstanceInfo };
      const itemTmp = createInstanceInfoTmp?.volumeMounts?.find(
        (ele: any) => ele.type === "network",
      ) || { type: "network", size: "", id: "", mountPath: "/network" };
      itemTmp["id"] = info.storageId;
      const itemOuts =
        createInstanceInfoTmp?.volumeMounts.filter(
          (ele: any) => ele.type !== "network",
        ) || [];
      const resultArr = [...itemOuts, itemTmp];
      createInstanceInfoTmp.volumeMounts = resultArr;
      createInstanceInfoTmp.storageId = info.storageId;
      createInstanceInfoTmp.storageName = info.storageName;
      setCreateInstanceInfo({
        ...createInstanceInfoTmp,
        productId: null,
        currProduct: null,
        gpuNum: 1,
      });
      emitDataFun(
        {
          ...createInstanceInfoTmp,
          productId: null,
          currProduct: null,
          gpuNum: 1,
        },
        false,
      );
      setParams({ ...params, clusterId: info.clusterId });
      const [rootFSSize, localVolumeSize] = getRootLocalSize(
        createInstanceInfo?.imageObj,
      );
      getListData(
        {
          ...params,
          clusterId: info.clusterId,
          storageId: info.storageId,
        },
        null,
        params.rootFSSize || rootFSSize,
        localVolumeSize,
        createInstanceInfo?.imageObj,
      );
    }
    setShowVolumeModal(false);
  };
  function changeCreateInstanceVolumeInfo(item: any, subItem: any, value: any) {
    const createInstanceInfoTmp = { ...createInstanceInfo };
    const clusterObj: any = myStorages.find(
      (item: any) => item.storageId === value,
    );
    let storageId = value;
    if (
      true &&
      clusterObj &&
      clusterObj.clusterId !== "-1" &&
      (
        filters?.clusters?.find(
          (item: any) => item.id === clusterObj.clusterId,
        ) || { supportNetStorage: false }
      ).supportNetStorage !== true
    ) {
      storageId = "-1";
      setParams({
        ...params,
        storageId: storageId,
        clusterId: clusterObj.clusterId,
      });
    }
    const itemTmp = createInstanceInfoTmp?.volumeMounts?.find(
      (ele: any) => ele.type === item,
    ) || { type: item, size: "", id: "", mountPath: "/network" };
    itemTmp[subItem] = storageId;
    const itemOuts =
      createInstanceInfoTmp?.volumeMounts.filter(
        (ele: any) => ele.type !== item,
      ) || [];
    const resultArr = [...itemOuts, itemTmp];
    createInstanceInfoTmp.volumeMounts = resultArr;
    const clusterTemp: any = myStorages.find(
      (item: any) => item.storageId === storageId,
    );
    if (clusterTemp) {
      createInstanceInfoTmp.storageId = clusterTemp.storageId;
      createInstanceInfoTmp.storageName = clusterTemp.storageName;
      setCreateInstanceInfo({
        ...createInstanceInfoTmp,
        productId: null,
        currProduct: null,
        gpuNum: 1,
      });
      emitDataFun(
        {
          ...createInstanceInfoTmp,
          productId: null,
          currProduct: null,
          gpuNum: 1,
        },
        false,
      );
      const clusterTempId: any = clusterTemp.clusterId;
      setParams({
        ...params,
        storageId: storageId,
        clusterId: clusterTempId,
      });
      const [rootFSSize, localVolumeSize] = getRootLocalSize(
        createInstanceInfo?.imageObj,
      );
      getListData(
        {
          ...params,
          clusterId: clusterTempId,
          storageId: storageId,
        },
        null,
        params.rootFSSize || rootFSSize,
        localVolumeSize,
        createInstanceInfo?.imageObj,
      );
    } else {
      createInstanceInfoTmp.storageId = "";
      createInstanceInfoTmp.storageName = "";
      setCreateInstanceInfo(createInstanceInfoTmp);
    }
  }
  function openCreateNetworkVolume() {
    handleOpenCreateNetworkVolume({
      userInfo,
      dispatch,
      router,
      path,
      hasStorageCreatePermission,
      setShowVolumeModal,
    });
  }
  const [openChangeTemplate, setOpenChangeTemplate] = useState({
    open: false,
  });
  const debouncedInput = useMemo(
    () =>
      debounce(
        (
          params: any,
          userId: any,
          rootFSSize: any,
          localVolumeSize: any,
          template: any,
        ) => {
          setCreateInstanceInfo({
            ...createInstanceInfo,
            productId: null,
            currProduct: null,
            gpuNum: 1,
          });
          emitDataFun(
            {
              ...createInstanceInfo,
              productId: null,
              currProduct: null,
              gpuNum: 1,
            },
            false,
          );
          getListData(
            {
              ...params,
              storageId: params.storageId,
            },
            userId,
            params.rootFSSize || rootFSSize,
            localVolumeSize,
            template,
          );
        },
        1000,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setCreateInstanceInfo, emitDataFun],
  );
  const myRef = useRef(null);
  const [recommendCardsShow, setRecommendCardsShow] = useState<any>([]);
  const [currentGpuNum, setCurrentGpuNum] = useState<number>(1);
  useEffect(() => {
    if (createInstanceInfo?.gpuNum) {
      setCurrentGpuNum(Number(createInstanceInfo.gpuNum));
    }
  }, [createInstanceInfo?.gpuNum]);
  const nodePrevAbortController = useRef<AbortController | undefined>();
  function changeGPUNumCreateInstanceInfo(value: any) {
    if (nodePrevAbortController.current) {
      nodePrevAbortController.current.abort("CanceledByUser");
    }
    const abortController = new AbortController();
    nodePrevAbortController.current = abortController;
    const [rootFSSize, localVolumeSize] = getRootLocalSize(
      createInstanceInfo?.imageObj,
    );
    let productsTmp: any = createInstanceInfo?.currProduct || {};
    reqGetMarketNode(
      {
        ...params,
        auth: Cookies.get("token") && userInfo.uuid,
        clusterId: params.clusterId === "-1" ? "" : params.clusterId,
        storageId: params.storageId === "-1" ? "" : params.storageId,
        cudaVersion: params.cudaVersion === "-1" ? "" : params.cudaVersion,
        gpuNum: Number(value),
        productId: productsTmp.productId,
        rootFSSize,
        localVolumeSize,
      },
      abortController.signal,
    )
      .then((res: any) => {
        productsTmp = hydrateMarketNodeProduct({
          selectItem: res.product,
          fallbackProduct: productsTmp,
          value,
          email,
        });
        setCreateInstanceInfo({
          ...createInstanceInfo,
          currProduct: productsTmp.originDatas[0],
          gpuNum: Number(value),
        });
        setDeployObj({
          ...deployObj,
          currProduct: productsTmp.originDatas[0],
          gpuNum: Number(value),
        });
        emitDataFun({
          ...deployObj,
          currProduct: productsTmp.originDatas[0],
          gpuNum: Number(value),
        });
      })
      .catch((error: any) => {
        if (error === "CanceledByUser" || error?.name === "AbortError") {
          return;
        }

        throw error;
      });
  }
  const {
    gpuNumMax,
    gpuNumOptions,
    selectedNetworkVolumeId,
    isNetworkVolumeUnsupported,
    networkVolumeOptions,
    clusterOptions,
  } = useStepOneDerivedOptions({
    createInstanceInfo,
    myStorages,
    filters,
    params,
  });

  const viewProps: StepOneViewProps = {
    state: {
      createInstanceInfo,
      setCreateInstanceInfo,
      recommendCardsShow,
      productsLoading,
      params,
      filters,
      dataInit,
      myRef,
      products,
      deployObj,
      currentGpuNum,
      showReadMe,
      templateListPrivate,
    },
    options: {
      selectedNetworkVolumeId,
      networkVolumeOptions,
      isNetworkVolumeUnsupported,
      clusterOptions,
      gpuNumMax,
      gpuNumOptions,
    },
    actions: {
      setShowReadMe,
      createMyTemplate,
      setOpenChangeTemplate,
      inputSetParamsText,
      openCreateNetworkVolume,
      changeCreateInstanceVolumeInfo,
      deployFun,
      submitRequest,
      setCurrentGpuNum,
      changeGPUNumCreateInstanceInfo,
      closeReadMe,
      addTemplate,
      updateList,
      finishOper,
      changeImageTemplate,
      changeOfficialTemplateCheck,
    },
    modals: {
      showCreateTemplateModal,
      showVolumeModal,
      openChangeTemplate,
    },
  };

  return <StepOneView {...viewProps} />;
};
export default StepOne;
