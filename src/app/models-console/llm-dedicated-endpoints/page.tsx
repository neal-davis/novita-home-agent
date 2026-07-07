"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import DedicatedEndpointList from "./sub-pages/DedicatedEndpointList";
import CreateEndpoint from "./sub-pages/CreateEndpoint";
import DedicatedEndpointDetail from "./sub-pages/DedicatedEndpointDetail";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import { getLLMDedicatedEndpointList } from "@/api/dedicated-endpoint";
import styles from "./page.module.scss";

const CACHE_KEY = "llm-dedicated-endpoints-cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL params
  const pageParam = searchParams.get("page");
  const idParam = searchParams.get("id");
  const modelIdParam = searchParams.get("modelId");
  const tabParam = searchParams.get("tab");
  const statusParam = searchParams.get("status") || "all";
  const endpointNameParam = searchParams.get("endpointName") || "";

  // Derive page state from URL
  // - ?page=create or ?modelId=xxx -> create page
  // - ?id=xxx -> detail page
  // - no params -> list page
  const currentPage = useMemo(() => {
    if (pageParam === "create" || modelIdParam) {
      return "create";
    }
    if (idParam) {
      return "detail";
    }
    return "list";
  }, [pageParam, idParam, modelIdParam]);

  const [dedicatedEndpointList, setDedicatedEndpointList] = useState<
    LLMDedicatedEndpoint[]
  >([]);
  const [dedicatedEndpointsLoading, setDedicatedEndpointsLoading] =
    useState(true);
  const [totalEndpointCount, setTotalEndpointCount] = useState(0);

  const [selectedEndpoint, setSelectedEndpoint] =
    useState<LLMDedicatedEndpoint | null>(null);

  const [filterStatus, setFilterStatus] = useState(statusParam);
  const [filterEndpointName, setFilterEndpointName] =
    useState(endpointNameParam);
  const lastListFetchKeyRef = useRef<string | null>(null);

  const getListUrl = useCallback(
    (status: string, endpointName: string) => {
      const params = new URLSearchParams();
      if (status && status !== "all") {
        params.set("status", status);
      }
      if (endpointName) {
        params.set("endpointName", endpointName);
      }
      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [pathname],
  );

  const fetchDedicatedEndpointList = useCallback(
    async (endpointName?: string, status?: string, sort?: string) => {
      const isInitialLoad = (!status || status === "all") && !endpointName;
      let hasFreshCache = false;

      // Try to read cache on initial load
      if (isInitialLoad) {
        try {
          const cached = sessionStorage.getItem(CACHE_KEY);
          if (cached) {
            const { endpoints, timestamp } = JSON.parse(cached);
            const isFresh = Date.now() - timestamp < CACHE_TTL;

            // Show cached data immediately
            setDedicatedEndpointList(endpoints);
            setTotalEndpointCount(endpoints.length);

            if (isFresh) {
              // Fresh cache: skip loading state, silent refresh
              setDedicatedEndpointsLoading(false);
              hasFreshCache = true;
            }
          }
        } catch {
          // Cache read failed, ignore
        }
      }

      // Show loading only if no fresh cache
      if (!hasFreshCache) {
        setDedicatedEndpointsLoading(true);
      }

      const { endpoints } = await getLLMDedicatedEndpointList({
        pageSize: 1000,
        pageNum: 1,
        sortKey: sort || "newest",
        filter: {
          status: status === "all" ? "" : status,
          endpointName,
        },
      });
      setDedicatedEndpointList(endpoints);

      if (isInitialLoad) {
        setTotalEndpointCount(endpoints.length);
        // Write to cache
        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ endpoints, timestamp: Date.now() }),
          );
        } catch {
          // Cache write failed, ignore
        }
      }
      setDedicatedEndpointsLoading(false);
    },
    [],
  );

  // Fetch list from URL filters so browser navigation keeps data in sync.
  useEffect(() => {
    const listFetchKey = `${endpointNameParam}\n${statusParam}`;
    if (
      currentPage === "list" &&
      lastListFetchKeyRef.current !== listFetchKey
    ) {
      lastListFetchKeyRef.current = listFetchKey;
      fetchDedicatedEndpointList(endpointNameParam, statusParam, "newest");
    }
  }, [currentPage, fetchDedicatedEndpointList, endpointNameParam, statusParam]);

  useEffect(() => {
    setFilterStatus(statusParam);
    setFilterEndpointName(endpointNameParam);
  }, [statusParam, endpointNameParam]);

  // Load endpoint data when on detail page
  useEffect(() => {
    if (currentPage === "detail" && idParam) {
      // Try to find from existing list first
      const endpoint = dedicatedEndpointList.find((ep) => ep.id === idParam);
      if (endpoint) {
        setSelectedEndpoint(endpoint);
      } else {
        // Fetch from API if not in list
        const fetchEndpoint = async () => {
          try {
            const { endpoints } = await getLLMDedicatedEndpointList({
              pageSize: 1,
              pageNum: 1,
              sortKey: "newest",
              filter: { id: idParam },
            });
            if (endpoints?.[0]) {
              setSelectedEndpoint(endpoints[0]);
            } else {
              router.replace(pathname);
            }
          } catch (error) {
            console.error("Failed to fetch endpoint:", error);
            router.replace(pathname);
          }
        };
        fetchEndpoint();
      }
    }
  }, [currentPage, idParam, dedicatedEndpointList, router, pathname]);

  const handleStatusChange = useCallback(
    (value: string) => {
      setFilterStatus(value);
      router.replace(getListUrl(value, filterEndpointName));
    },
    [filterEndpointName, getListUrl, router],
  );

  const handleEndpointNameChange = useCallback(
    (value: string) => {
      setFilterEndpointName(value);
      router.replace(getListUrl(filterStatus, value));
    },
    [filterStatus, getListUrl, router],
  );

  // Frontend filtering for search (provides immediate response while API loads)
  const filteredList = useMemo(() => {
    if (!filterEndpointName) return dedicatedEndpointList;

    const searchTerm = filterEndpointName.toLowerCase();
    return dedicatedEndpointList.filter((endpoint) => {
      const endpointName = endpoint.name?.toLowerCase() || "";
      const modelId = endpoint.baseModel?.modelId?.toLowerCase() || "";
      const modelAlias = endpoint.baseModel?.modelAlias?.toLowerCase() || "";
      return (
        endpointName.includes(searchTerm) ||
        modelId.includes(searchTerm) ||
        modelAlias.includes(searchTerm)
      );
    });
  }, [dedicatedEndpointList, filterEndpointName]);

  const syncEndpointData = useCallback(async () => {
    // Use idParam directly to avoid race condition with ref updates
    if (!idParam) return;

    try {
      const { endpoints } = await getLLMDedicatedEndpointList({
        pageSize: 1,
        pageNum: 1,
        sortKey: "newest",
        filter: { id: idParam },
      });
      if (endpoints?.[0]) {
        setSelectedEndpoint(endpoints[0]);
      }
    } catch (error) {
      console.error("Failed to sync endpoint data:", error);
    }
  }, [idParam]);

  // Navigate to detail page
  const handleGoToDetail = useCallback(
    (endpoint: LLMDedicatedEndpoint, tab: string = "overview") => {
      // Only set selectedEndpoint if it has complete data (e.g. resources field)
      // Otherwise set null to trigger loading state, let useEffect fetch full data
      if (endpoint.resources) {
        setSelectedEndpoint(endpoint);
      } else {
        setSelectedEndpoint(null);
      }
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      params.delete("modelId");
      params.set("id", endpoint.id);
      if (tab !== "overview") {
        params.set("tab", tab);
      } else {
        params.delete("tab");
      }
      router.push(`${pathname}?${params.toString()}`);
      // Scroll console main container to top
      const mainContainer = document.querySelector(
        '[class*="ConsoleHeaderWrapper_main"]',
      );
      if (mainContainer) {
        mainContainer.scrollTop = 0;
      }
    },
    [router, pathname, searchParams],
  );

  // Navigate to create page
  const handleGoToCreateEndpoint = useCallback(() => {
    router.push(`${pathname}?page=create`);
  }, [router, pathname]);

  // Navigate to list page
  const handleGoToListPage = useCallback(() => {
    setSelectedEndpoint(null);
    // Clear cache so returning to list always shows fresh data (e.g. newly created endpoint)
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore
    }
    lastListFetchKeyRef.current = `${filterEndpointName}\n${filterStatus}`;
    fetchDedicatedEndpointList(filterEndpointName, filterStatus, "newest");
    router.push(getListUrl(filterStatus, filterEndpointName));
  }, [
    filterEndpointName,
    filterStatus,
    fetchDedicatedEndpointList,
    getListUrl,
    router,
  ]);

  // List page
  if (currentPage === "list") {
    return (
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
        resource={PERMISSION.RESOURCE.llm_dedicated_endpoints}
        action={PERMISSION.ACTION.read}
      >
        <div
          className={`${styles.container} p-4 ${
            dedicatedEndpointsLoading ? "h-full overflow-hidden" : ""
          }`}
        >
          <DedicatedEndpointList
            goToCreateEndpoint={handleGoToCreateEndpoint}
            goToDetail={handleGoToDetail}
            dedicatedEndpointList={filteredList}
            totalCount={totalEndpointCount}
            loading={dedicatedEndpointsLoading}
            filterStatus={filterStatus}
            filterEndpointName={filterEndpointName}
            onStatusChange={handleStatusChange}
            onEndpointNameChange={handleEndpointNameChange}
            refreshList={() => {
              // Clear cache and refresh list
              try {
                sessionStorage.removeItem(CACHE_KEY);
              } catch {
                // Ignore
              }
              setFilterStatus("all");
              setFilterEndpointName("");
              lastListFetchKeyRef.current = "\nall";
              fetchDedicatedEndpointList("", "all", "newest");
              router.replace(pathname);
            }}
          />
        </div>
      </PermissionWrapper>
    );
  }

  // Create page
  if (currentPage === "create") {
    return (
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
        resource={PERMISSION.RESOURCE.llm_dedicated_endpoints}
        action={PERMISSION.ACTION.read}
      >
        <div className={`${styles.container} p-4`}>
          <CreateEndpoint
            goToListPage={handleGoToListPage}
            goToDetail={handleGoToDetail}
            initialModelId={modelIdParam || undefined}
          />
        </div>
      </PermissionWrapper>
    );
  }

  // Detail page
  if (currentPage === "detail") {
    if (!selectedEndpoint) {
      // Loading state while fetching endpoint
      return (
        <PermissionWrapper
          resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
          resource={PERMISSION.RESOURCE.llm_dedicated_endpoints}
          action={PERMISSION.ACTION.read}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[var(--gray-2)] border-t-[var(--brand-0)] rounded-full animate-spin" />
              <span className="text-[13px] text-[var(--dark-2)]">
                Loading...
              </span>
            </div>
          </div>
        </PermissionWrapper>
      );
    }

    return (
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
        resource={PERMISSION.RESOURCE.llm_dedicated_endpoints}
        action={PERMISSION.ACTION.read}
      >
        <DedicatedEndpointDetail
          goToListPage={handleGoToListPage}
          endpointData={selectedEndpoint}
          syncEndpointData={syncEndpointData}
          initialTab={tabParam || "overview"}
        />
      </PermissionWrapper>
    );
  }

  return null;
}
