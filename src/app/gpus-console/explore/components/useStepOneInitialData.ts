import { useEffect } from "react";
import Cookies from "js-cookie";
import { reqGetStorage } from "@/api/gpu-instance/storage";
import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import {
  reqGetOfficialTemplates,
  reqGetTemplates,
} from "@/api/gpu-instance/templates";
import { getUrlParams } from "./dealUrlParams";

export function useStepOneInitialData({
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
}: any) {
  useEffect(() => {
    async function init() {
      if (Cookies.get("token") && !email) {
        return;
      }
      let createInstanceInfoOutTmp = { ...createInstanceInfo };
      if (createInstanceInfo.createInstanceInfoOut) {
        createInstanceInfoOutTmp = {
          ...createInstanceInfo.createInstanceInfoOut,
        };
        createInstanceInfoOutTmp.storageId =
          createInstanceInfoOutTmp.storageId &&
          createInstanceInfoOutTmp.storageId !== "-1"
            ? createInstanceInfoOutTmp.storageId
            : getUrlParams("storageId");
        let netItem: any = createInstanceInfoOutTmp?.volumeMounts?.find(
          (item: any) => item.type === "network",
        );
        if (!netItem) {
          netItem = {
            type: "network",
            id: createInstanceInfoOutTmp.storageId,
            size: 0,
            mountPath: "/network",
          };
        }
        const localItems: any =
          createInstanceInfoOutTmp?.volumeMounts?.filter(
            (item: any) => item.type !== "network",
          ) || [];
        createInstanceInfoOutTmp.volumeMounts = [...localItems, netItem];
        setCreateInstanceInfo({
          ...createInstanceInfoOutTmp,
          clusterId: createInstanceInfoOutTmp.clusterId
            ? createInstanceInfoOutTmp.clusterId
            : "-1",
          cudaVersion: createInstanceInfoOutTmp.cudaVersion
            ? createInstanceInfoOutTmp.cudaVersion
            : "-1",
        });
      } else {
        createInstanceInfoOutTmp.storageId =
          createInstanceInfoOutTmp.storageId &&
          createInstanceInfoOutTmp.storageId !== "-1"
            ? createInstanceInfoOutTmp.storageId
            : getUrlParams("storageId");
        let netItem: any = createInstanceInfoOutTmp?.volumeMounts?.find(
          (item: any) => item.type === "network",
        );
        if (!netItem) {
          netItem = {
            type: "network",
            id: createInstanceInfoOutTmp.storageId,
            size: 0,
            mountPath: "/network",
          };
        }
        const localItems: any =
          createInstanceInfoOutTmp?.volumeMounts?.filter(
            (item: any) => item.type !== "network",
          ) || [];
        createInstanceInfoOutTmp.volumeMounts = [...localItems, netItem];
        createInstanceInfoOutTmp.billingMode =
          spotUrlParams === "1" ? "spot" : "onDemand";
        setCreateInstanceInfo(createInstanceInfoOutTmp);
      }
      setParams({
        ...params,
        cudaVersion: createInstanceInfoOutTmp.cudaVersion
          ? createInstanceInfoOutTmp.cudaVersion
          : "-1",
      });
      // const func = userInfo.uuid ? reqGetTemplates : reqGetOfficialTemplates;
      // const reqParams = userInfo.uuid
      //   ? {
      //       channels: ["official", "community", "private"],
      //     }
      //   : {
      //       channels: ["official", "community"],
      //     };
      let teamTemplatesReq: any = {};
      if (userInfo.uuid) {
        teamTemplatesReq = await reqGetTemplates({
          channels: ["private"],
          isMyCommunity: true,
        });
      }
      const teamTemplates = teamTemplatesReq?.template || [];
      reqGetOfficialTemplates({
        channels: ["official"],
        isMyCommunity: true,
      }).then((res: any) => {
        const tmpArr: any = res?.template || [];
        const tmp = tmpArr.sort((a: any, b: any) => {
          if (a.channel === "official" && b.channel !== "official") {
            return -1;
          }
          if (a.channel !== "official" && b.channel === "official") {
            return 1;
          }
          if (
            a.channel === b.channel &&
            Number(a.sort || 0) !== Number(b.sort || 0)
          ) {
            return Number(b.sort || 0) - Number(a.sort || 0);
          }
          if (a.collectNum === b.collectNum) {
            return Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
          } else {
            return Number(b.collectNum || 0) - Number(a.collectNum || 0);
          }
        });
        setTemplateListOfficial(tmp);
        const templates: any = {};
        tmp.forEach((item: any) => {
          if (item.Id === createInstanceInfoOutTmp?.imageID) {
            templates[item?.Id || ""] = true;
          } else {
            templates[item?.Id || ""] = false;
          }
        });
        if (!createInstanceInfoOutTmp?.imageID && tmp.length > 0) {
          let paramsUrl = "";
          const urlParams = getUrlParams("templateId");
          if (
            (tmp || [])
              .concat(teamTemplates)
              .find((item: any) => item.Id === urlParams)
          ) {
            paramsUrl = urlParams;
          } else if (
            (tmp || [])
              .concat(teamTemplates)
              .find(
                (item: any) =>
                  item.Id ===
                  (typeof window !== "undefined"
                    ? localStorage.getItem("templateId") || ""
                    : ""),
              )
          ) {
            paramsUrl =
              typeof window !== "undefined"
                ? localStorage.getItem("templateId") || ""
                : "";
          }
          let currentTemplate = (tmp || [])
            .concat(teamTemplates)
            .find((item: any) => item.Id === paramsUrl);
          if (
            !currentTemplate &&
            (tmp || []).concat(teamTemplates).length > 0
          ) {
            const tempArr = tmp.filter(
              (item: any) => item.channel === "official",
            );
            if (tempArr.length > 0) {
              currentTemplate = tempArr[0];
            } else {
              currentTemplate = tmp[0];
            }
          }
          if (
            createInstanceInfoOutTmp.initPg === 0 &&
            paramsUrl &&
            currentTemplate
          ) {
            createInstanceInfoOutTmp.templateId = currentTemplate.Id;
            createInstanceInfoOutTmp.imageID = currentTemplate.Id;
            createInstanceInfoOutTmp.imageObj = currentTemplate;
            setCreateInstanceInfo({
              ...createInstanceInfoOutTmp,
              productId: null,
              currProduct: null,
              gpuNum: 1,
            });
            templates[currentTemplate.Id] = true;
          } else {
            createInstanceInfoOutTmp.initPg = 1;
            createInstanceInfoOutTmp.imageID = tmp[0].Id;
            createInstanceInfoOutTmp.imageObj = tmp[0];
            setCreateInstanceInfo({
              ...createInstanceInfoOutTmp,
              productId: null,
              currProduct: null,
              gpuNum: 1,
            });
            templates[tmp[0].Id] = true;
          }
        }
        setParams({
          ...params,
          cudaVersion: createInstanceInfoOutTmp.cudaVersion
            ? createInstanceInfoOutTmp.cudaVersion
            : "-1",
          rootFSSize:
            createInstanceInfoOutTmp?.imageObj?.rootfsSize ||
            createInstanceInfoOutTmp?.rootfsSize ||
            0,
        });
        setOfficialTemplates(templates);
        reqUserInfo({})
          .then((res: any) => {
            initFilterProducts(
              createInstanceInfoOutTmp,
              (res || {}).uuid,
              createInstanceInfoOutTmp?.imageObj,
            );
            hasStorageReadPermission &&
              reqGetStorage({}).then((res: any) => {
                setMyStorages(res.data || []);
              });
          })
          .catch(() => {
            initFilterProducts(
              createInstanceInfoOutTmp,
              undefined,
              createInstanceInfoOutTmp?.imageObj,
            );
          })
          .finally(() => {});
      });
      hasTemplateReadPermission &&
        reqGetTemplates({
          channels: ["private"],
          isMyCommunity: true,
        }).then((res: any) => {
          setTemplateListPrivate(res?.template || []);
        });
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);
}
