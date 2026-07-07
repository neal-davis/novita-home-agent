"use client";

import { Plus, RotateCw } from "lucide-react";
import { ServerlessProvider } from "./Context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import { useEffect, useRef, useState, useCallback } from "react";
import { Endpoint, getEndpointsWithTotal } from "@/api/gpu-instance/serverless";
import TeamMemberSelector, {
  TeamMember,
} from "@/app/components/TeamMemberSelector";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { SearchInput } from "@/components/ui/input";
import ServerlessItem from "./item";
import Pagination from "@/components/ui/standard/pagination";
import DataEmpty from "@/app/gpus-console/components/DataEmpty";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function ServerlessDeploy({
  initData,
}: {
  initData: Endpoint[];
}) {
  const router = useRouter();
  const { locale } = useI18n();
  const userInfo = useAppSelector((state: any) => state.user);
  const [init, setInit] = useState(false);
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initData);
  const [loading, setLoading] = useState(false);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [filterCreator, setFilterCreator] = useState<TeamMember | null>(null);
  const [pageInfo, setPageInfo] = useState<any>({
    pageSize: 10,
    pageNum: 1,
  });
  const [searchValue, setSearchValue] = useState("");
  const [total, setTotal] = useState(0);
  const refreshEndpointsRef = useRef(() => {});

  useEffect(() => {
    if (initData && initData.length > 0 && !init) {
      setEndpoints(initData);
      setInit(true);
    }
  }, [init, initData]);

  const refreshEndpoints = useCallback(() => {
    setLoading(true);
    getEndpointsWithTotal({
      filter: {
        pageSize: pageInfo.pageSize,
        pageNum: pageInfo.pageNum,
        searchMsg: searchValue,
        creators: filterCreator?.ids?.join(",") || "",
      },
    })
      .then((res: any) => {
        setEndpoints(res.endpoints || []);
        setTotal(res.total || 0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filterCreator?.ids, pageInfo.pageNum, pageInfo.pageSize, searchValue]);
  refreshEndpointsRef.current = refreshEndpoints;

  useEffect(() => {
    if (!userInfo.uuid) {
      setEndpoints([]);
    } else {
      if (init) {
        refreshEndpoints();
      }
    }
  }, [
    pageInfo.pageSize,
    pageInfo.pageNum,
    searchValue,
    filterCreator,
    init,
    userInfo.uuid,
    refreshEndpoints,
  ]);

  useEffect(() => {
    if (!userInfo.uuid) return;
    const id = setInterval(() => refreshEndpointsRef.current(), 6000);
    return () => clearInterval(id);
  }, [userInfo.uuid]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPageInfo((prev: { pageSize: number; pageNum: number }) => ({
      ...prev,
      pageNum: 1,
    }));
  }, []);

  return (
    <ServerlessProvider>
      <div className="w-full">
        <div className="flex flex-row justify-between items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="lg"
              className="h-9"
              onClick={() => {
                router.push(
                  getLocalizedPath(
                    NOVITA_URL.GPU_CONSOLE_SERVERLESS_DEPLOY,
                    locale,
                  ),
                );
              }}
            >
              <Plus className="w-3 h-3 mr-1 text-white" />
              {"Create Endpoint"}
            </Button>
            {currentTeam && (
              <TeamMemberSelector
                className="h-9"
                onSelect={(member) => {
                  setFilterCreator(member);
                  setPageInfo({ ...pageInfo, pageNum: 1 });
                  analytics.trackClick(
                    CLICK_BTN_IDs.GPUS_CONSOLE.SERVERLESS_SELECTED_MEMBER,
                  );
                }}
              />
            )}
            <Button
              variant="ghost"
              size="lg"
              className="w-8 h-8"
              onClick={() => {
                refreshEndpoints();
              }}
            >
              <RotateCw className="w-4 h-4 shrink-0 text-[var(--dark-1)]" />
            </Button>
          </div>
          <SearchInput
            placeholder="Instance Name/lD Filter/GPU Type"
            className="h-9 w-[340px]"
            value={searchValue}
            onSearch={handleSearch}
          />
        </div>
        <div className="flex flex-col gap-4">
          {endpoints?.map((endpoint: any) => (
            <ServerlessItem
              key={endpoint.id}
              endpoint={endpoint}
              refresh={refreshEndpoints}
            />
          ))}
        </div>
        {total > pageInfo.pageSize && (
          <div>
            <Pagination
              total={total}
              defaultCurrent={pageInfo.pageNum}
              pageSize={pageInfo.pageSize}
              onChange={(page) => {
                setPageInfo({ ...pageInfo, pageNum: page });
              }}
            />
          </div>
        )}
        {endpoints.length === 0 && (
          <div>
            <DataEmpty />
          </div>
        )}
      </div>
    </ServerlessProvider>
  );
}
