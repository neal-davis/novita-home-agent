import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getCreateEndpointConstraints,
  CreateConstraints,
  GPUInfoItem,
  getEndpointSpecs,
  getServerlessProductPrice,
} from "@/api/gpu-instance/serverless";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { reqBalanceTotal } from "@/api/gpu-instance/billing";
import { useAppSelector } from "@/store";
import { reqMarketQueryOptions } from "@/api/gpu-instance/explore";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
const commonTips = {
  success: "success",
  paginationPreTxt: "Rows per page",
  balanceNotEnough: "Balance is not enough.",
  portLimit: "Please enter valid port, split with [,] port can be 1 to 65535",
  port2000: "Port can not be 2222, 2223, 2224",
  portSame: "Exposed ports cannot be same.",
  httpTcpPortSame: "Exposed http ports and tcp ports cannot be same.",
  httpTcpPortLimit: "Exposed http ports and tcp ports cannot be more than 25.",
  emptyKeyValue: "Key can not be empty",
  loginFailure: "Login failure, please log in again",
  itemIsRequired: "This field is required",
  loginFirst: "Please log in first",
  instanceStatus: {
    Creating: "Creating",
    Created: "Created",
    Starting: "Starting",
    Running: "Running",
    Stopping: "Stopping",
    Exited: "Exited",
    Terminating: "Terminating",
    Terminated: "Terminated",
    creating: "creating",
    toCreate: "toCreate",
    pulling: "pulling",
    running: "running",
    toStart: "toStart",
    starting: "starting",
    migrating: "migrating",
    toStop: "toStop",
    stopping: "stopping",
    exited: "exited",
    toRemove: "toRemove",
    removing: "removing",
    removed: "removed",
    resetting: "resetting",
    toRestart: "toRestart",
    restarting: "restarting",
    other: "other",
  },
  noData: "No Data",
  copyFailed: "Copy failed",
  copySuccess: "Copy success",
  clickCopy: "Click to copy",
  maxHttp10: "The max number of http ports is 10",
  newVoucherTitle: "New Voucher",
  newVoucherTip: "Received a new voucher!",
  newVoucherView: "view",
  invalidImagePath: "The container image is not valid",
  gpuPriceDot: 2,
  storagePriceDot: 3,
};
type ServerlessContextType = {
  products: GPUInfoItem[];
  storagePrice: number | string;
  productsLoading: boolean;
  formConstraints: CreateConstraints;
  clusterList: {
    name: string;
    id: string;
  }[];
  authList: {
    name: string;
    id: string;
  }[];
  arrears: boolean;
  serverlessAuthority: boolean;
};
const ServerlessContext = createContext<ServerlessContextType | undefined>(
  undefined,
);
const defaultCreateConstraints: CreateConstraints = {
  minRootfsSize: 10,
  maxRootfsSize: 100,
  freeRootfsSize: 100,
  minLocalVolumeSize: 10,
  maxLocalVolumeSize: 300,
  freeLocalVolumeSize: 200,
  minWorkerNum: 1,
  maxWorkerNum: 1000,
  minFreeTimeout: 1,
  maxFreeTimeout: 1000,
  minConcurrencyNum: 1,
  maxConcurrencyNum: 1000,
  minQueueWaitTime: 1,
  maxQueueWaitTime: 1000,
  minRequestNum: 1,
  maxRequestNum: 1000,
  cudaVersionList: ["12.1", "12.2"],
  minRequestTimeout: 1,
  maxRequestTimeout: 1800,
  minAsyncRequestNum: 1,
  maxAsyncRequestNum: 10,
};
export const ServerlessProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const hasContainerRegistryAuthReadPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.gpu_setting,
    resource: PERMISSION.RESOURCE.container_registry_auth,
    action: PERMISSION.ACTION.read,
  });
  const [products, setProducts] = useState<GPUInfoItem[]>([]);
  const [storagePrice, setStoragePrice] = useState<number | string>("---");
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [formConstraints, setFormConstraints] = useState<CreateConstraints>(
    defaultCreateConstraints,
  );
  const [clusterList, setClusterList] = useState<
    {
      name: string;
      id: string;
    }[]
  >([]);
  const [authList, setAuthList] = useState<
    {
      name: string;
      id: string;
    }[]
  >([]);
  const [arrears, setArrears] = useState(false);
  const [serverlessAuthority] = useState(true);
  const uuid = useAppSelector((state) => state.user.uuid);
  const fetchData = useCallback(async () => {
    const isLogin = !!uuid;
    try {
      setProductsLoading(true);
      const endpointSpecs = await getEndpointSpecs({ auth: isLogin });
      setProducts(endpointSpecs || []);
      getServerlessProductPrice().then((res) => {
        setStoragePrice(
          (
            Number(res.basePrice0) /
            (Number(res.pricePrecision) || 1) /
            10000
          ).toFixed(commonTips.storagePriceDot),
        );
      });
      setProductsLoading(false);
      if (isLogin) {
        const constraints = await getCreateEndpointConstraints();
        setFormConstraints(constraints);
        const clusterList = await reqMarketQueryOptions({ auth: uuid || "" });
        setClusterList(
          (clusterList.clusters || []).map((item: any) => ({
            name: item.name,
            id: item.id,
          })),
        );
        if (hasContainerRegistryAuthReadPermission) {
          const auths = await reqGetImageAuths({});
          setAuthList(auths.data);
        }
        const response = await reqBalanceTotal({ businessType: "serverless" });
        setArrears(
          Number(response.credit || 0) +
            Number(response.userBalance || 0) +
            Number(response.voucherBalance || 0) <=
            0,
        );
      }
    } catch (error) {
      setProductsLoading(false);
      console.error("Error fetching data:", error);
    }
  }, [uuid, hasContainerRegistryAuthReadPermission]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <ServerlessContext.Provider
      value={{
        products,
        storagePrice,
        productsLoading,
        formConstraints,
        clusterList,
        authList,
        arrears,
        serverlessAuthority,
      }}
    >
      {children}
    </ServerlessContext.Provider>
  );
};
export const useServerlessContext = () => {
  const context = useContext(ServerlessContext);
  if (!context) {
    throw new Error(
      "useServerlessContext must be used within a ServerlessProvider",
    );
  }
  return context;
};
