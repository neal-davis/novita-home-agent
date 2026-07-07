"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { message } from "@/components/ui/standard/notify";
import ModelItem from "../modelItem/modelItem";
import styles from "./modelList.module.css";
import { debounce } from "lodash-es";
import {
  getCivitaiModelDetails,
  getModelDetail,
  getModels,
  searchCivitaiModel,
} from "@/api/model";
import BaseModelFilter from "../BaseModelFilter/BaseModelFilter";
import FloatBtn from "../FloatBtn/FloatBtn";
import SearchBar from "../SearchBar/SearchBar";
import { MODEL_LIST_PAGE_SIZE } from "@/constants/constants";
import Loading from "@/app/components/Loading/Loading_new";
import { Empty } from "./Empty";

export const CIVITAL_URL_REGEX =
  /https:\/\/civitai\.com\/models\/(\d+)(\/\S+)?(\?\S*)?\/?(#\S*)?$/;
export const CIVITAL_URL_REGEX_WITH_VERSION =
  /https:\/\/civitai\.com\/models\/(\d+)\?(\S*&)?modelVersionId=(\d+)(&\S*)?$/;

const MessageMap_en = {
  Model_NOT_FOUND: "Model not found",
  Model_Search_Error: "An error occured when searching model",
};

export const MessageMap = MessageMap_en;

export const getModelId = (
  url: string,
): { modelId: string; versionId?: string } => {
  if (CIVITAL_URL_REGEX_WITH_VERSION.test(url)) {
    return {
      modelId: url.match(CIVITAL_URL_REGEX_WITH_VERSION)?.[1] || "",
      versionId: url.match(CIVITAL_URL_REGEX_WITH_VERSION)?.[3] || "",
    };
  }
  if (CIVITAL_URL_REGEX.test(url)) {
    return {
      modelId: url.match(CIVITAL_URL_REGEX)?.[1] || "",
    };
  }
  return { modelId: "" };
};

export enum ModelType {
  base = "checkpoint",
  lora = "lora",
  controlnet = "controlnet",
  vae = "vae",
  upscaler = "upscaler",
  textual_inversion = "textualinversion",
}

export interface ModelListMethods {
  resizeWrapper: () => void;
  onClose: () => void;
}

const ModelList = forwardRef<ModelListMethods, ModelListProps>(
  (
    {
      initModelList,
      type,
      modelType,
      needDetails,
      onSelect,
      selectedModelId,
      selectedModelName,
      selectedModelAPIName,
      itemWidth,
      parentDom,
      widthTransition,
      filter,
      fixedBaseModel,
      defaultBaseModel,
    }: ModelListProps,
    ref,
  ) => {
    const [wrapWidth, setWrapWidth] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [nextCursor, setNextCursor] = useState("c_0");
    const [modelList, setModelList] = useState<Model[]>(initModelList || []);
    const [baseModel, setBaseModel] = useState(defaultBaseModel || "");
    const [searchModelId, setSearchModelId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [inputLoading, setInputLoading] = useState(false);
    const [finished, setFinished] = useState(false);
    const [queryInput, setQueryInput] = useState<string>("");

    const scrollPosition = useRef(0);
    const fetchIdx = useRef(0);
    const modelListCache = useRef<Model[]>([]);
    const pageIdxCache = useRef(0);
    const modelTypeCache = useRef(modelType);
    const baseModelCache = useRef("");
    const wrapperEl = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      resizeWrapper: () => {
        onResize();
        if (parentDom) {
          if (modelListCache.current.length > 0) {
            setModelList(modelListCache.current);
            setPageIndex(pageIdxCache.current);
            setBaseModel(baseModelCache.current);
            return;
          }
          if (scrollPosition.current && wrapperEl.current?.parentElement) {
            const parentEl = wrapperEl.current.parentElement;
            parentEl.scrollTop = scrollPosition.current;
          }
        }
      },
      onClose: () => {
        if (parentDom) {
          if (wrapperEl.current?.parentElement) {
            const parentEl = wrapperEl.current.parentElement;
            scrollPosition.current = parentEl.scrollTop;
          }
          pageIdxCache.current = pageIndex;
          modelListCache.current = modelList;
          baseModelCache.current = baseModel;
        }
      },
    }));

    const fetchModelList = useCallback(
      ({
        pageIdx,
        modelType,
        filterBaseModel,
        resetModelList,
        query,
        cursor,
      }: {
        pageIdx: number;
        modelType?: string;
        filterBaseModel?: string;
        resetModelList?: boolean;
        query?: string;
        cursor?: string;
      }) => {
        setLoading(true);
        getModels({
          pageSize: MODEL_LIST_PAGE_SIZE,
          pageIndex: pageIdx,
          type: modelType,
          filter: {
            source:
              filter?.source === undefined
                ? "civitai"
                : (filter?.source as string),
            is_sdxl: filter?.is_sdxl as boolean,
            in_whitelist: true,
            is_inpainting: filter?.is_inpainting as boolean,
            query: query,
            base_model:
              fixedBaseModel ||
              (filterBaseModel === undefined ? baseModel : filterBaseModel),
          },
          cursor,
          fetchId: fetchIdx.current,
        })
          .then(({ models, nextCursor, fetchId }) => {
            if (fetchId !== fetchIdx.current) return;
            if (resetModelList) {
              setModelList(models);
              setSearchModelId("");
              setNextCursor("c_0");
              modelListCache.current = models;
              pageIdxCache.current = 1;
              setPageIndex(1);
              if (parentDom) {
                const parentEl = wrapperEl.current?.parentElement;
                if (parentEl) {
                  parentEl.scrollTop = 0;
                }
              } else {
                window.scrollTo(0, 0);
              }
              return;
            }
            setModelList((pre) => {
              const arr: any[] = [];
              models.map((model: { id: number }) => {
                if (
                  model.id &&
                  pre.findIndex((item) => item.id === model.id) === -1
                ) {
                  arr.push(model);
                }
              });
              return [...pre, ...arr];
            });
            setSearchModelId("");
            setNextCursor(nextCursor);
            setPageIndex(pageIdx + 1);
            pageIdxCache.current = pageIdx + 1;
            setFinished(models.length === 0);
          })
          .catch(() => {})
          .finally(() => {
            setLoading(false);
            setInputLoading(false);
            fetchIdx.current += 1;
          });
      },
      [
        baseModel,
        filter?.is_inpainting,
        filter?.is_sdxl,
        filter?.source,
        fixedBaseModel,
        parentDom,
      ],
    );

    const setBaseModelFn = useCallback(
      (v: string) => {
        setBaseModel(v);
        baseModelCache.current = v;
        fetchModelList({
          pageIdx: 0,
          cursor: "c_0",
          modelType,
          filterBaseModel: v,
          resetModelList: true,
          query: queryInput,
        });
      },
      [fetchModelList, modelType, queryInput],
    );

    const debouncedFetchModelList = debounce(() => {
      if (!loading && !finished) {
        fetchModelList({
          pageIdx: pageIndex,
          modelType: modelType,
          cursor: nextCursor,
          resetModelList: false,
          query: queryInput,
        });
      }
    }, 200);

    useEffect(() => {
      if (fixedBaseModel) {
        setBaseModel(fixedBaseModel);
        baseModelCache.current = fixedBaseModel;
      } else if (defaultBaseModel) {
        setBaseModel(defaultBaseModel);
        baseModelCache.current = defaultBaseModel;
      } else {
        setBaseModel("");
        baseModelCache.current = "";
      }
    }, [fixedBaseModel, defaultBaseModel]);

    useEffect(() => {
      if (modelType !== modelTypeCache.current) {
        modelTypeCache.current = modelType;
        pageIdxCache.current = 0;
        modelListCache.current = [];
        scrollPosition.current = 0;
        setPageIndex(0);
        fetchModelList({
          pageIdx: 0,
          cursor: "c_0",
          modelType,
          resetModelList: true,
        });
        return;
      }

      if (!initModelList || initModelList.length === 0) {
        pageIdxCache.current = 0;
        setPageIndex(0);
        fetchModelList({
          pageIdx: 0,
          cursor: "c_0",
          modelType,
          resetModelList: true,
        });
      } else {
        pageIdxCache.current = 1;
        setPageIndex(1);
      }
    }, [fetchModelList, initModelList, modelType]);

    useEffect(() => {
      let parentEl: HTMLElement | Window;
      if (parentDom && wrapperEl.current?.parentElement) {
        parentEl = wrapperEl.current.parentElement;
      } else {
        parentEl = window;
      }

      const handleScroll = () => {
        const { scrollTop, clientHeight, scrollHeight } = parentDom
          ? parentEl
          : document.documentElement;
        if (scrollTop + clientHeight >= (scrollHeight / 5) * 4) {
          debouncedFetchModelList();
        }
      };

      // 附加滚动事件侦听器
      parentEl.addEventListener("scroll", handleScroll);

      // 在组件卸载时清除滚动事件侦听器
      return () => {
        parentEl.removeEventListener("scroll", handleScroll);
      };
    }, [debouncedFetchModelList, parentDom]);

    const onResize = useCallback(() => {
      if (!wrapperEl.current) {
        return;
      }
      const parent = (wrapperEl.current as HTMLDivElement).parentElement;
      if (!parent) {
        return;
      }
      const { clientWidth } = parent;
      const columnWidth = itemWidth ? itemWidth + 16 : 336;
      let maxStore = Math.floor((clientWidth - 30) / columnWidth);
      if (maxStore < 1) maxStore = 1;
      setWrapWidth(maxStore * columnWidth - 16);
    }, [itemWidth]);

    const debouncedResize = debounce(() => {
      onResize();
    }, 300);

    useEffect(() => {
      window.addEventListener("resize", debouncedResize);
      return () => {
        window.removeEventListener("resize", debouncedResize);
      };
    }, [parentDom, debouncedResize]);

    useLayoutEffect(() => {
      debouncedResize();
    }, [debouncedResize]);

    const handleSearchByLink = useCallback(
      async (civitalModelId: string, civitaiModelVersionId?: string) => {
        setSearchModelId(civitalModelId);
        setLoading(true);
        if (civitaiModelVersionId) {
          try {
            const nDetails = await getModelDetail(
              Number.parseInt(civitaiModelVersionId),
            );
            if (!nDetails) {
              message.error(MessageMap.Model_NOT_FOUND);
              setLoading(false);
              setModelList([]);
              setPageIndex(1);
              return;
            }
            setModelList([
              {
                base_model: "",
                base_model_type: "",
                categories: [],
                cover_url: nDetails.cover_url || "",
                hash_sha256: nDetails.hash_sha256,
                id: nDetails.model_id,
                name: nDetails.name,
                sd_name: nDetails.model_name,
                sd_name_in_api: nDetails.model_name,
                source: "civitai",
                status: nDetails.status || 1,
                tags: nDetails.tags,
                type: {
                  name: nDetails.type,
                  display_name: nDetails.type,
                },
                is_nsfw: nDetails.is_nsfw || false,
                is_sdxl: nDetails.is_sdxl || false,
                is_sd3: nDetails.is_sd3 || false,
              },
            ]);
            setPageIndex(1);
            setLoading(false);
          } catch (err) {
            console.error(err);
            message.error(MessageMap.Model_Search_Error);
            setLoading(false);
          }
          return;
        }
        try {
          const cDetails = await getCivitaiModelDetails(civitalModelId);
          if (cDetails?.modelVersions?.length > 0) {
            const result = await searchCivitaiModel(cDetails.modelVersions, 5);
            setModelList(result);
            setPageIndex(1);
          } else {
            setLoading(false);
            setModelList([]);
            setPageIndex(1);
            message.error(MessageMap.Model_NOT_FOUND);
          }
          setLoading(false);
        } catch (err) {
          console.error(err);
          message.error(MessageMap.Model_Search_Error);
          setLoading(false);
        }
      },
      [],
    );

    const handleSearch = useCallback(
      (inputs: string | undefined) => {
        setQueryInput(inputs ?? "");
        if (!inputs) return;
        if (inputs && inputs.includes("http")) {
          const mid = getModelId(inputs);
          if (mid.modelId) {
            handleSearchByLink(mid.modelId, mid.versionId);
          }
          return;
        }

        setInputLoading(true);
        fetchModelList({
          pageIdx: 0,
          cursor: "c_0",
          modelType,
          query: inputs,
          resetModelList: true,
        });
      },
      [fetchModelList, modelType, handleSearchByLink],
    );

    // const isMatureBlur = getFlagFromStore(MODE_SEARCH_MATURE_BLUR);

    return (
      <div
        className={styles.wrap}
        ref={wrapperEl}
        style={{
          width: wrapWidth ? wrapWidth : "100%",
          marginLeft: "auto",
          marginRight: "auto",
          transition: widthTransition === false ? "" : "width 0.2s ease-in",
        }}
      >
        <BaseModelFilter
          baseModel={baseModel}
          setBaseModel={setBaseModelFn}
          disabled={!!fixedBaseModel}
        />
        <SearchBar
          loading={loading}
          inputLoading={inputLoading}
          onSearch={handleSearch}
          debounceInputSearch={debounce(handleSearch, 500)}
          onEmpty={() => {
            setInputLoading(true);
            fetchModelList({
              pageIdx: 0,
              cursor: "c_0",
              modelType,
              resetModelList: true,
              query: "",
            });
            setFinished(false);
          }}
          searchModelId={searchModelId}
        />
        <div className={styles.list_wrap}>
          {modelList.length > 0 &&
            modelList.map((item) => {
              return (
                <ModelItem
                  key={item.id}
                  componentType={type}
                  needDetails={needDetails}
                  onSelect={(details) => {
                    onSelect?.(details);
                  }}
                  selected={
                    selectedModelId === item.id ||
                    selectedModelName === item.sd_name ||
                    selectedModelAPIName === item.sd_name_in_api
                  }
                  itemWidth={itemWidth}
                  model={item}
                />
              );
            })}
          {loading && <Loading style={{ maxHeight: 500 }} />}
          {modelList.length === 0 && !loading && <Empty />}
        </div>
        <FloatBtn />
      </div>
    );
  },
);

ModelList.displayName = "ModelList";

export default ModelList;
