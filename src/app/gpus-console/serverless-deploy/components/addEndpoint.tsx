"use client";
import styles from "./addEndpoint.module.scss";
import { message } from "@/components/ui/standard/notify";
// import { useServerlessContext } from "./Context";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import { useAppDispatch, useAppSelector } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { UserState } from "@/store/slice/userSlice";
import { setUserState } from "@/store/slice/userSlice";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import {
  computeFieldErrors,
  firstFieldErrorKey,
  firstFieldErrorMessage,
  genRandomEndpointName,
  scrollToFirstFieldErrorElement,
} from "./addEndpointFormHelpers";
import AddEndpointFields from "./AddEndpointFields";
import AddEndpointModals from "./AddEndpointModals";
export type AddEndpointRef = {
  checkValid: () => string;
};
const AddEndpoint = forwardRef<
  AddEndpointRef,
  {
    mode?: "Create" | "Edit";
    endpoint?: any;
    onGpuCountChange?: (count: number) => void;
    onGetCreateParameter?: (params: any) => void;
    authList?: any[];
    clusterList?: any[];
    formConstraints: any;
  }
>(function AddEndpoint(
  {
    mode = "Create",
    endpoint = null,
    onGpuCountChange,
    onGetCreateParameter,
    authList = [],
    clusterList = [],
    formConstraints,
  },
  ref,
) {
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
  const [storageOptions, setStorageOptions] = useState<any[]>([]);
  const [myAuthList, setMyAuthList] = useState(authList);
  useEffect(() => {
    setMyAuthList(authList || []);
  }, [authList]);
  useEffect(() => {
    const fetchStorageOptions = () => {
      reqGetStorage({}).then((res) => {
        setStorageOptions(res.data || []);
      });
    };
    fetchStorageOptions();
  }, []);
  //   { label: formDict.createCloudStorage, value: "create" },
  //   ...storageOptions.map((storage) => ({
  //     label: storage.storageName,
  //     value: storage.storageId,
  //   })),
  // ]
  const gpusPerWorkerOptions = Array.from({ length: 8 }, (_, i) => ({
    label: String(i + 1),
    value: i + 1,
  }));
  // const { authList, clusterList, formConstraints } = useServerlessContext();
  const defaultClusterFirstId =
    clusterList?.length &&
    clusterList[0]?.id != null &&
    String(clusterList[0].id) !== ""
      ? String(clusterList[0].id)
      : null;
  const defaultEndpointNameRef = useRef<string | null>(null);
  if (defaultEndpointNameRef.current === null) {
    defaultEndpointNameRef.current = genRandomEndpointName();
  }
  const defaultEndpointName = defaultEndpointNameRef.current;
  const initData = {
    type: "sync",
    name: defaultEndpointName,
    appName: "",
    minWorker: 1,
    maxWorker: 3,
    idleTimeout: 60,
    maxConcurrency: 1,
    gpusPerWorker: 1,
    cudaVersion: "",
    requestTimeout: 120,
    scalePolicy: "queue",
    maxReqCount: 1,
    queueDelayTime: 4,
    imageAddr: "",
    imageCredential: "", // allow clear
    httpPort: "", // min: 1, max: 65535,
    startCmd: "",
    osDiskSize: formConstraints.freeRootfsSize,
    isLocalMount: false,
    localDiskSize: formConstraints.freeLocalVolumeSize,
    localMountPath: "/workspace",
    networkStorageId: "",
    networkStorageMountPath: "/network",
    clusterIDs: defaultClusterFirstId ? [defaultClusterFirstId] : [],
    healthCheckPath: "/",
    envs: [],
  };
  const [params, setParams] = useState(mode === "Create" ? initData : endpoint);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const fieldErrors = useMemo(
    () => computeFieldErrors(params, mode, formConstraints),
    [params, mode, formConstraints],
  );
  /** Errors / red borders only after parent calls checkValid (outer confirm). */
  const [validationVisible, setValidationVisible] = useState(false);
  const visibleFieldErrors = useMemo(
    () => (validationVisible ? fieldErrors : {}),
    [validationVisible, fieldErrors],
  );
  useEffect(() => {
    onGetCreateParameter?.(params);
  }, [onGetCreateParameter, params]);
  const endpointStableKey =
    endpoint?.id ?? endpoint?.name ?? endpoint?.endpointId ?? null;
  useEffect(() => {
    setValidationVisible(false);
  }, [mode, endpointStableKey]);
  const checkValid = useCallback(() => {
    setValidationVisible(true);
    const p = paramsRef.current;
    if (!p) return "Form is not ready";
    const errors = computeFieldErrors(p, mode, formConstraints);
    const msg = firstFieldErrorMessage(errors);
    if (msg) {
      const key = firstFieldErrorKey(errors);
      if (key) scrollToFirstFieldErrorElement(key, p);
    }
    return msg;
  }, [mode, formConstraints]);
  useImperativeHandle(ref, () => ({ checkValid }), [checkValid]);
  const [cudaVersionList, setCudaVersionList] = useState<any[]>([]);
  useEffect(() => {
    setCudaVersionList(formConstraints.cudaVersionList || []);
    if (mode === "Create") {
      setParams((prev: any) => ({
        ...prev,
        osDiskSize: formConstraints.freeRootfsSize,
        localDiskSize: formConstraints.freeLocalVolumeSize,
      }));
    }
  }, [formConstraints, mode]);
  /** clusterList 异步到达时补默认 Region；useState 初始化只执行一次，单靠 initData 无效 */
  useEffect(() => {
    if (mode !== "Create" || defaultClusterFirstId == null) return;
    setParams((prev: any) => {
      if (Array.isArray(prev.clusterIDs) && prev.clusterIDs.length > 0) {
        return prev;
      }
      return { ...prev, clusterIDs: [defaultClusterFirstId] };
    });
  }, [mode, defaultClusterFirstId]);
  const [showAddImageAuth, setShowAddImageAuth] = useState({
    showModal: false,
  });
  const addAuthValue = useCallback((mark?: boolean, id?: string) => {
    setShowAddImageAuth((prev) => ({ ...prev, showModal: false }));
    if (mark && id) {
      reqGetImageAuths({})
        .then((res: any) => {
          // setMyAuths(res?.data || []);
          setMyAuthList(res?.data || []);
        })
        .then(() => {
          // const values = formRef.current?.getValues();
          // values.imageCredential = id;
          // setInitFormValue(values);
          setParams((prev: any) => ({ ...prev, imageCredential: id }));
        });
    } else {
      reqGetImageAuths({}).then((res: any) => {
        // setMyAuths(res?.data || []);
        setMyAuthList(res?.data || []);
      });
    }
  }, []);
  const [showAddNetworkStorageAuth, setShowAddNetworkStorageAuth] = useState({
    showModal: false,
  });
  const networkVolumeMountRef = useRef<HTMLDivElement | null>(null);
  const addNetworkStorageAuthValue = useCallback(
    (mark?: boolean, info?: any) => {
      setShowAddNetworkStorageAuth((prev) => ({
        ...prev,
        showModal: false,
      }));
      if (mark && info) {
        reqGetStorage({})
          .then((res: any) => {
            // setMyAuths(res?.data || []);
            setStorageOptions(res?.data || []);
          })
          .then(() => {
            // const values = formRef.current?.getValues();
            // values.imageCredential = id;
            // setInitFormValue(values);
            setParams((prev: any) => ({
              ...prev,
              networkStorageId: info.storageId || "",
              clusterIDs: info.clusterId
                ? [info.clusterId]
                : prev.clusterIDs || [],
            }));
          });
      } else {
        reqGetStorage({}).then((res: any) => {
          // setMyAuths(res?.data || []);
          setStorageOptions(res?.data || []);
        });
      }
    },
    [],
  );
  return (
    <div className={styles.create_form}>
      <AddEndpointFields
        state={{
          mode,
          endpoint,
          params,
          showAddImageAuth,
          isAuth,
          showAddNetworkStorageAuth,
        }}
        actions={{
          setParams,
          onGpuCountChange,
          setShowAddImageAuth,
          setShowAddNetworkStorageAuth,
        }}
        options={{
          gpusPerWorkerOptions,
          cudaVersionList,
          myAuthList,
          storageOptions,
          clusterList,
        }}
        validation={{
          formConstraints,
          visibleFieldErrors,
        }}
      />
      <AddEndpointModals
        showAddImageAuth={showAddImageAuth}
        setShowAddImageAuth={setShowAddImageAuth}
        addAuthValue={addAuthValue}
        showAddNetworkStorageAuth={showAddNetworkStorageAuth}
        addNetworkStorageAuthValue={addNetworkStorageAuthValue}
        networkVolumeMountRef={networkVolumeMountRef}
      />
    </div>
  );
});
AddEndpoint.displayName = "AddEndpoint";
export default AddEndpoint;
