"use client";

import { SearchInput } from "@/components/ui/input";
import styles from "../page.module.scss";
import DateToggleGroup from "./DateToggleGroup";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import SelectTemplate from "./selectTemplate";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import TableSpinner from "../components/TableSpinner";
import { NoData } from "@/components/ui/standard/no-data";
import StandardPagination from "@/components/ui/standard/pagination";
import {
  reqOfficialTemplateList,
  reqSandboxList,
  reqSandboxTemplateList,
} from "@/api/sandbox";
import { sliceUTCString } from "@/lib/utils/date";
import SelectRefreshInterval from "./selectRefreshInterval";
import { SandboxNoData } from "@/components/ui/standard/sandbox-no-data";
import { Button } from "@/components/ui/button";
import { DOCS_URL } from "@/constants/urls";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import SingleMetrics from "../components/singleMetrics";
import SandboxGuide from "../components/SandboxGuide";
import { RefreshCw } from "lucide-react";
import { message } from "@/components/ui/standard/notify";
import { Input as AntInput } from "@/components/ui/input";
import debounce from "lodash.debounce";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchAllTeamMembers } from "@/store/slice/userSlice";
import TeamMemberSelector, {
  TeamMember,
} from "@/app/components/TeamMemberSelector";
import MemberCell from "@/app/components/Table/MemberCell";

function createDateGroupOptions() {
  return [
    {
      label: "5 minutes ago",
      value: "5",
    },
    {
      label: "10 minutes ago",
      value: "10",
    },
    {
      label: "1 hours ago",
      value: "60",
    },
  ];
}
const pageSize = 10;

export default function Page() {
  const dispatch = useAppDispatch();
  const teamMembers = useAppSelector((state) => state.user.allTeamMembers);
  const allTeamMembers = useMemo(() => teamMembers || [], [teamMembers]);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);

  useEffect(() => {
    if (currentTeam) {
      dispatch(fetchAllTeamMembers() as any);
    }
  }, [currentTeam, dispatch]);

  const [creatorFilter, setCreatorFilter] = useState<
    TeamMember | null | undefined
  >(undefined);

  const dateGroupOptions = createDateGroupOptions();
  const [filterOptions, setFilterOptions] = useState<any>({
    name: "",
    cycleType: "0",
    templateId: "",
    cpuCount: 1,
    memory: 512,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<any[]>([]);
  const [sortOptions, setSortOptions] = useState<any>({
    sortKey: "",
    sortType: "",
  });
  const [allTemplates, setAllTemplates] = useState<any[]>([]);
  const [officialTemplates, setOfficialTemplates] = useState<any[]>([]);
  const [sandboxTemplates, setSandboxTemplates] = useState<any[]>([]);

  useEffect(() => {
    setAllTemplates([...officialTemplates, ...sandboxTemplates]);
  }, [officialTemplates, sandboxTemplates]);

  useEffect(() => {
    reqOfficialTemplateList({}).then((res: any) => {
      let officialData = res?.templates || [];
      if (officialData.length > 0) {
        officialData = officialData.map((item: any) => ({
          ...item,
          aliases: [item.alias || ""],
          isOfficial: true,
        }));
      }
      setOfficialTemplates(officialData);
    });
    reqSandboxTemplateList({}).then((res: any) => {
      setSandboxTemplates(
        (res?.templates || []).map((ele: any) => ({
          ...ele,
          aliases: [ele.alias || ""],
        })),
      );
    });
  }, []);

  const handleSort = useCallback(
    (key: string) => {
      if (sortOptions.sortKey === key) {
        let sortType = "";
        if (sortOptions.sortType === "") {
          sortType = "asc";
        } else if (sortOptions.sortType === "asc") {
          sortType = "desc";
        } else {
          sortType = "";
        }
        setSortOptions({
          sortKey: key,
          sortType: sortType,
        });
      } else {
        setSortOptions({
          sortKey: key,
          sortType: "asc",
        });
      }
    },
    [sortOptions.sortKey, sortOptions.sortType],
  );
  const getSortType = useCallback(
    (key: string) => {
      if (sortOptions.sortKey === key) {
        if (sortOptions.sortType === "") {
          return "/sandbox/console/sortDefault.svg";
        } else if (sortOptions.sortType === "asc") {
          return "/sandbox/console/sortAsc.svg";
        } else {
          return "/sandbox/console/sortDesc.svg";
        }
      } else {
        return "/sandbox/console/sortDefault.svg";
      }
    },
    [sortOptions.sortKey, sortOptions.sortType],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "Sandbox ID",
        header: "Sandbox ID",
        className: "min-w-[120px] md:min-w-[150px] xl:min-w-[200px]",
        render: (row: any) => row.sandboxID + "-" + row.clientID,
      },
      {
        accessorKey: "Template",
        header: "Template",
        className: "min-w-[120px] md:min-w-[150px] xl:min-w-[200px]",
        render: (row: any) => {
          const template = allTemplates.find(
            (item) => item.templateID === row.templateID,
          );
          return template?.aliases?.length > 0 && template.aliases[0]
            ? row.templateID + " (" + template.aliases[0] + ")"
            : row.templateID;
        },
      },
      {
        accessorKey: "CPU Count",
        header: (
          <span
            onClick={() => handleSort("cpu")}
            className="inline-flex p-1 rounded-[4px] flex-row items-center gap-1 cursor-pointer hover:bg-[var(--gray-2)]"
          >
            CPU Count
            <img src={getSortType("cpu")} alt="sort" className="w-4 h-4" />
          </span>
        ),
        className: "min-w-[80px] md:min-w-[90px] xl:min-w-[100px]",
        render: (row: any) => {
          return (
            <span>
              <span className="text-[var(--brand-1)]">{row.cpuCount} </span>
              <span className="text-[var(--black)]">
                {Number(row.cpuCount) > 1 ? "Cores" : "Core"}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: "Memory",
        header: (
          <span
            onClick={() => handleSort("memory")}
            className="inline-flex p-1 rounded-[4px] flex-row items-center gap-1 cursor-pointer hover:bg-[var(--gray-2)]"
          >
            Memory
            <img src={getSortType("memory")} alt="sort" className="w-4 h-4" />
          </span>
        ),
        className: "min-w-[60px] md:min-w-[55px] xl:min-w-[100px]",
        render: (row: any) => {
          return (
            <span>
              <span className="text-[var(--brand-1)]">{row.memoryMB} </span>
              <span className="text-[var(--brand-1)]">MiB</span>
            </span>
          );
        },
      },
      {
        accessorKey: "Started At",
        header: (
          <span
            onClick={() => handleSort("startedAt")}
            className="inline-flex p-1 rounded-[4px] flex-row items-center gap-1 cursor-pointer hover:bg-[var(--gray-2)]"
          >
            Started At
            <img
              src={getSortType("startedAt")}
              alt="sort"
              className="w-4 h-4"
            />
          </span>
        ),
        className: "min-w-[120px] md:min-w-[150px] xl:min-w-[200px]",
        render: (row: any) => {
          return sliceUTCString(
            new Date(row.startedAt).toUTCString(),
            "minute",
          );
        },
      },
      ...(currentTeam
        ? [
            {
              accessorKey: "Creator",
              header: "Creator",
              className: "min-w-[100px] md:min-w-[120px]",
              render: (row: any) => {
                const memberId = row.memberID;
                if (!memberId) return "Unknown";
                const member = allTeamMembers.find(
                  (m: any) => m.memberId === memberId,
                );
                if (!member) {
                  return "Unknown";
                } else {
                  return <MemberCell memberID={row.memberID} />;
                }
              },
            },
          ]
        : []),
      {
        accessorKey: "State",
        header: "State",
        className: "min-w-[120px] md:min-w-[100px] xl:min-w-[120px] text-right",
        render: (row: any) => {
          switch (row.state) {
            case "running":
              return (
                <div className="flex flex-row items-center gap-2 justify-end">
                  <span className="text-[var(--brand-1)]">Running</span>
                  <img
                    onClick={() => {
                      const index = dataList.findIndex(
                        (item) => item.sandboxID === row.sandboxID,
                      );
                      if (index === -1) {
                        searchSandbox();
                        return;
                      }
                      const dataListTmp = [...dataList];
                      dataListTmp[index].showMetrics = !(
                        dataListTmp[index]?.showMetrics || false
                      );
                      setDataList(dataListTmp);
                    }}
                    alt=""
                    src={
                      (row?.state === "running" && row?.showMetrics) || false
                        ? "/gpu-instance/instances/icon-chevron-up.svg"
                        : "/gpu-instance/instances/icon-chevron-down.svg"
                    }
                    className={
                      (row?.state === "running" && row?.showMetrics) || false
                        ? styles.expandedIcon
                        : styles.expandIcon
                    }
                  />
                </div>
              );
            case "paused":
              return (
                <div className="flex flex-row items-center gap-2 justify-end">
                  <span className="text-[var(--black)]">Paused</span>
                  <img
                    onClick={() => {
                      const index = dataList.findIndex(
                        (item) => item.sandboxID === row.sandboxID,
                      );
                      if (index === -1) {
                        searchSandbox();
                        return;
                      }
                      const dataListTmp = [...dataList];
                      dataListTmp[index].showMetrics = !(
                        dataListTmp[index]?.showMetrics || false
                      );
                      setDataList(dataListTmp);
                    }}
                    alt=""
                    src={
                      (row?.state === "paused" && row?.showMetrics) || false
                        ? "/gpu-instance/instances/icon-chevron-up.svg"
                        : "/gpu-instance/instances/icon-chevron-down.svg"
                    }
                    className={
                      (row?.state === "paused" && row?.showMetrics) || false
                        ? styles.expandedIcon
                        : styles.expandIcon
                    }
                  />
                </div>
              );
            case "cloning":
              return (
                <div className="text-right">
                  <span className="text-[var(--dark-1)]">Cloning</span>
                </div>
              );
            default:
              return (
                <div className="text-right">
                  <span className="text-[var(--dark-1)]">Unknown</span>
                </div>
              );
          }
        },
      },
    ],
    [
      getSortType,
      currentTeam,
      allTemplates,
      handleSort,
      allTeamMembers,
      dataList,
    ],
  );

  const handleChange = useCallback((obj: Partial<any>) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
    setFilterOptions((prevOptions: any) => ({
      ...prevOptions,
      ...obj,
    }));
  }, []);

  const [originData, setOriginData] = useState<any[]>([]);
  const [hasFetchedSandboxes, setHasFetchedSandboxes] = useState(false);
  useEffect(() => {
    searchSandbox();
  }, []);

  function searchSandbox() {
    setLoading(true);
    reqSandboxList({})
      .then((res) => {
        setOriginData(res?.sandboxes || []);
      })
      .finally(() => {
        setLoading(false);
        setHasFetchedSandboxes(true);
      });
  }

  useEffect(() => {
    let data = originData;
    data = originData.filter((item) => {
      let flag = true;
      if (filterOptions.name && filterOptions.name.trim()) {
        flag = item.sandboxID.includes(filterOptions.name.trim());
        if (!flag) {
          return false;
        }
      }
      if (filterOptions.templateId && filterOptions.templateId !== "all") {
        flag = item.templateID === filterOptions.templateId;
        if (!flag) {
          return false;
        }
      }
      if (filterOptions.cycleType || Number(filterOptions.cycleType) > 0) {
        flag =
          new Date(new Date(item.startedAt).toUTCString()).getTime() <
          new Date(
            new Date(
              Date.now() - Number(filterOptions.cycleType) * 60 * 1000,
            ).toUTCString(),
          ).getTime();
        if (!flag) {
          return false;
        }
      }
      if (filterOptions.cpuCount || Number(filterOptions.cpuCount) >= 0) {
        flag = Number(item.cpuCount) >= Number(filterOptions.cpuCount);
        if (!flag) {
          return false;
        }
      }
      if (filterOptions.memory || Number(filterOptions.memory) >= 0) {
        flag = Number(item.memoryMB) >= Number(filterOptions.memory);
        if (!flag) {
          return false;
        }
      }
      if (creatorFilter) {
        const itemMemberId = item.memberID;
        flag = creatorFilter.ids.includes(itemMemberId);
        if (!flag) {
          return false;
        }
      }
      return flag;
    });
    if (sortOptions.sortKey && sortOptions.sortType) {
      if (["cpu", "memory"].includes(sortOptions.sortKey)) {
        data = data.sort((a, b) => {
          if (sortOptions.sortKey === "cpu") {
            return sortOptions.sortType === "asc"
              ? a.cpuCount - b.cpuCount
              : b.cpuCount - a.cpuCount;
          } else {
            return sortOptions.sortType === "asc"
              ? a.memoryMB - b.memoryMB
              : b.memoryMB - a.memoryMB;
          }
        });
      } else if (sortOptions.sortKey === "startedAt") {
        data = data.sort((a, b) => {
          return sortOptions.sortType === "asc"
            ? new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
            : new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
        });
      }
    }
    setDataList((prevDataList) =>
      data.map((item) => ({
        ...item,
        showMetrics:
          prevDataList.find((ele) => item.sandboxID === ele.sandboxID)
            ?.showMetrics || false,
      })),
    );
  }, [originData, filterOptions, sortOptions, creatorFilter]);

  function getStorage(memoryMB: number) {
    if (memoryMB < 1024) {
      return memoryMB + " MiB";
    } else {
      return (
        Number(
          (Math.round((memoryMB / 1024) * 10000000) / 10000000).toFixed(7),
        ) + " GiB"
      );
    }
  }

  const cpuCountDebounce = useMemo(
    () =>
      debounce((e) => {
        if (isNaN(Number(e.target.value)) || Number(e.target.value) < 1) {
          handleChange({
            currentPage: 1,
            cpuCount: 1,
          });
          e.target.value = "1";
          message.error(
            "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
          );
        } else {
          if (Number(e.target.value) % 1 !== 0) {
            message.error(
              "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
            );
            handleChange({
              currentPage: 1,
              cpuCount: Math.round(Number(e.target.value)),
            });
            e.target.value = Math.round(Number(e.target.value)) + "";
          } else {
            handleChange({
              currentPage: 1,
              cpuCount: Number(e.target.value),
            });
          }
        }
      }, 1000),
    [handleChange],
  );

  const memoryDebounce = useMemo(
    () =>
      debounce((e) => {
        const inputValue = Number(e.target.value);
        if (isNaN(inputValue) || inputValue < 512) {
          handleChange({
            currentPage: 1,
            memory: 512,
          });
          e.target.value = "512";
          message.error(
            "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
          );
        } else {
          const nearestMultiple = Math.round(inputValue / 512) * 512;
          if (inputValue % 512 !== 0) {
            message.error(
              "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
            );
            handleChange({
              currentPage: 1,
              memory: nearestMultiple,
            });
            e.target.value = nearestMultiple.toString();
          } else {
            handleChange({
              currentPage: 1,
              memory: inputValue,
            });
          }
        }
        analytics.trackClick(CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER, {
          memory: Number(e.target.value),
        });
      }, 1000),
    [handleChange],
  );

  const shouldShowGuide = hasFetchedSandboxes && originData.length === 0;

  const refreshControls = (
    <div className="flex flex-row items-center gap-2 justify-end">
      <Button
        id={CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_REFRESH}
        className="ml-auto w-4 h-4 no-underline"
        variant="text"
        size="icon"
        onClick={() => searchSandbox()}
        disabled={loading}
      >
        {loading ? (
          <TableSpinner standalone size={16} />
        ) : (
          <RefreshCw size={16} className="hover:opacity-50" />
        )}
      </Button>
      <div className="h-[15px] w-[1px] bg-[var(--gray-1)]"></div>
      <SelectRefreshInterval
        onRefresh={() => searchSandbox()}
        onSelect={(value: any) => {
          analytics.trackClick(CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER, {
            refreshInterval: value.value,
          });
        }}
      />
    </div>
  );

  if (!hasFetchedSandboxes && loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <TableSpinner standalone />
      </div>
    );
  }

  if (shouldShowGuide) {
    return (
      <div className="flex flex-col gap-4 px-[160px] py-8">
        <SandboxGuide />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2 flex-wrap justify-between">
        <div className="flex flex-row items-center gap-2">
          <SearchInput
            className={`h-8 rounded-[6px] w-[300px] target:border-[var(--dark-1)] ${styles.input}`}
            placeholder="Find a Sandbox"
            style={{ maxWidth: 300 }}
            onSearch={(value) => {
              handleChange({ currentPage: 1, name: value });
              analytics.trackClick(
                CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER,
                {
                  name: value,
                },
              );
            }}
          />
          <div className="inline-flex items-center gap-2">
            <span className="bg-[var(--brand-2)] rounded-[4px] border !border-[var(--brand-1)] px-[6px] py-1 inline-flex items-center gap-1">
              <img
                src="/sandbox/console/dot.svg"
                alt="dot"
                className="w-1 h-1"
              />
              <span className="font-small-console text-[var(--brand-1)]">
                {
                  (dataList || []).filter(
                    (item: any) => item.state === "running",
                  ).length
                }
              </span>
              <span className="font-small-console text-[var(--dark-1)]">
                Running
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center gap-2">
          {refreshControls}
        </div>
      </div>
      <div className="flex flex-row items-end gap-2 flex-wrap">
        <div>
          <p className={styles.filter_label}>Started</p>
          <DateToggleGroup
            selected={filterOptions.cycleType}
            options={dateGroupOptions}
            onCycleChange={(cycleType) => {
              handleChange({ cycleType, currentPage: 1 });
              analytics.trackClick(
                CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER,
                {
                  cycleType:
                    cycleType && cycleType !== "0"
                      ? cycleType + " minutes ago"
                      : "",
                },
              );
            }}
          />
        </div>
        <div>
          <p className={styles.filter_label}>Template</p>
          <SelectTemplate
            className={styles.topSelectSearchNew}
            onSelect={(value: any) => {
              handleChange({
                currentPage: 1,
                templateId: value?.templateID || "",
              });
              analytics.trackClick(
                CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER,
                {
                  templateId: value?.templateID || "",
                },
              );
            }}
          />
        </div>
        <div>
          <p
            className={`${styles.filter_label} flex flex-row items-center justify-between`}
          >
            <span>CPU Cores</span>
            <span className="text-[var(--brand-1)]">
              {Number(filterOptions.cpuCount)}{" "}
              {Number(filterOptions.cpuCount) > 1 ? "Cores" : "Core"}
            </span>
          </p>
          <div className="relative items-center w-[210px]">
            <AntInput
              min={0}
              value={filterOptions.cpuCount}
              type="number"
              placeholder=""
              className={`w-full h-[32px] rounded-[6px] ${styles.input}`}
              style={{
                width: "100%",
                paddingLeft: "32px",
                paddingRight: "14px",
                textAlign: "center",
              }}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === "" || !isNaN(Number(inputValue))) {
                  setFilterOptions((prevOptions: any) => ({
                    ...prevOptions,
                    cpuCount: inputValue === "" ? 0 : Number(inputValue),
                  }));
                }
                cpuCountDebounce(e);
              }}
            />
            <span
              className="absolute left-[12px] cursor-pointer top-[7px]"
              onClick={() => {
                if (filterOptions.cpuCount >= 2) {
                  handleChange({
                    currentPage: 1,
                    cpuCount: filterOptions.cpuCount - 1,
                  });
                  analytics.trackClick(
                    CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER,
                    {
                      cpuCount: filterOptions.cpuCount - 1,
                    },
                  );
                } else {
                  handleChange({
                    currentPage: 1,
                    cpuCount: 1,
                  });
                  message.error(
                    "Automatically adjusted to the nearest valid value (CPU must be an integer, minimum is 1)",
                  );
                }
              }}
            >
              <img
                src="/sandbox/console/sub.svg"
                className="w-[18px] h-[18px]"
                width={18}
                height={18}
                alt="sub"
              />
            </span>
            <span
              className="absolute right-[12px] cursor-pointer top-[7px] bg-[var(--white)]"
              onClick={() => {
                handleChange({
                  currentPage: 1,
                  cpuCount: filterOptions.cpuCount + 1,
                });
                analytics.trackClick(
                  CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER,
                  {
                    cpuCount: filterOptions.cpuCount + 1,
                  },
                );
              }}
              style={{
                zIndex: 9,
              }}
            >
              <img
                src="/sandbox/console/plus.svg"
                className="w-[18px] h-[18px]"
                width={18}
                height={18}
                alt="plus"
              />
            </span>
          </div>
        </div>
        <div>
          <p
            className={`${styles.filter_label} flex flex-row items-center justify-between`}
          >
            <span>Memory</span>
            <span className="text-[var(--brand-1)]">
              {getStorage(Number(filterOptions.memory || 0))}
            </span>
          </p>
          <div className="relative items-center w-[210px]">
            <AntInput
              min={0}
              value={filterOptions.memory}
              type="number"
              placeholder=""
              className={`w-full h-[32px] rounded-[6px] ${styles.input}`}
              style={{
                width: "100%",
                paddingLeft: "32px",
                paddingRight: "42px",
                textAlign: "center",
              }}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue === "" || !isNaN(Number(inputValue))) {
                  setFilterOptions((prevOptions: any) => ({
                    ...prevOptions,
                    memory: inputValue === "" ? 0 : Number(inputValue),
                  }));
                }

                memoryDebounce(e);
              }}
            />
            <span
              className="absolute left-[12px] cursor-pointer top-[7px]"
              onClick={() => {
                if (filterOptions.memory >= 1024) {
                  // const yu = filterOptions.memory % 512;
                  const bei = Math.floor(filterOptions.memory / 512);
                  if (bei === 0) {
                    handleChange({
                      currentPage: 1,
                      memory: 0,
                    });
                    analytics.trackClick(
                      CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER,
                      {
                        memory: 0,
                      },
                    );
                  } else {
                    handleChange({
                      currentPage: 1,
                      memory: filterOptions.memory - 512,
                    });
                    analytics.trackClick(
                      CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER,
                      {
                        memory: filterOptions.memory - 512,
                      },
                    );
                  }
                } else {
                  handleChange({
                    currentPage: 1,
                    memory: 512,
                  });
                  message.error(
                    "Automatically adjusted to the nearest valid value (only multiples of 512 MiB are supported, minimum is 512 MiB)",
                  );
                }
              }}
            >
              <img
                src="/sandbox/console/sub.svg"
                className="w-[18px] h-[18px]"
                width={18}
                height={18}
                alt="sub"
              />
            </span>
            <span
              className="absolute right-[36px] font-subtle text-[var(--dark-5)] top-[8px] bg-[var(--white)]"
              style={{
                zIndex: 9,
              }}
            >
              MiB
            </span>
            <span
              className="absolute right-[12px] cursor-pointer top-[7px] bg-[var(--white)]"
              onClick={() => {
                handleChange({
                  currentPage: 1,
                  memory: filterOptions.memory + 512,
                });
                analytics.trackClick(
                  CLICK_BTN_IDs.SANDBOX_CONSOLE.SANDBOX_FILTER,
                  {
                    memory: filterOptions.memory + 512,
                  },
                );
              }}
              style={{
                zIndex: 9,
              }}
            >
              <img
                src="/sandbox/console/plus.svg"
                className="w-[18px] h-[18px]"
                width={18}
                height={18}
                alt="plus"
              />
            </span>
          </div>
        </div>
        {currentTeam && (
          <div>
            <p className={styles.filter_label}>Creator</p>
            <div className="flex flex-row items-center gap-2">
              <TeamMemberSelector
                className="h-[32px] w-[210px] rounded-[6px]"
                selectedMember={creatorFilter}
                onSelect={(member: TeamMember | null) => {
                  setCreatorFilter(member);
                  handleChange({ currentPage: 1 });
                }}
              />
              <Button
                variant={
                  creatorFilter &&
                  creatorFilter.ids.includes(currentTeam.memberId)
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="h-[32px] rounded-[6px] whitespace-nowrap"
                onClick={() => {
                  if (
                    creatorFilter &&
                    creatorFilter.ids.includes(currentTeam.memberId)
                  ) {
                    setCreatorFilter(undefined);
                  } else {
                    const me = allTeamMembers.find(
                      (m: any) => m.memberId === currentTeam.memberId,
                    );
                    setCreatorFilter({
                      ids: [currentTeam.memberId],
                      email: me?.email || "",
                      phone: me?.phone || "",
                      alias: me?.alias,
                    });
                  }
                  handleChange({ currentPage: 1 });
                }}
              >
                Only Mine
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[6px] border border-[var(--gray-2)] px-4 py-2">
        <Table loading={loading}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  className={column.className || ""}
                  key={column.accessorKey}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {dataList.length > 0 && (
            <TableBody>
              {dataList
                .slice(
                  (filterOptions.currentPage - 1) * pageSize,
                  filterOptions.currentPage * pageSize,
                )
                .map((row, index) => (
                  <Fragment key={index}>
                    <TableRow>
                      {columns.map((column, index) => {
                        const accessorKey = columns[index]
                          .accessorKey as keyof typeof row;
                        return (
                          <TableCell
                            key={column.accessorKey}
                            className={styles.table_cell}
                          >
                            {column.render
                              ? column.render(row)
                              : row[accessorKey]}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {(row.state === "running" || row.state === "paused") &&
                      row.showMetrics && (
                        <SingleMetrics
                          state={row.state}
                          sandboxID={row.sandboxID}
                          colCount={columns.length}
                        />
                      )}
                  </Fragment>
                ))}
            </TableBody>
          )}
          {loading && (
            <tbody className="min-h-[300px] h-[300px]">
              <TableSpinner tdColNum={columns.length} />
            </tbody>
          )}
          {!loading && dataList.length === 0 && (
            <tbody>
              <tr>
                <td colSpan={columns.length}>
                  <div className="min-h-[300px] flex flex-col justify-center items-center py-8">
                    {(!filterOptions.name ||
                      filterOptions.name.trim() === "") &&
                    Number(filterOptions.cycleType) === 0 &&
                    (filterOptions.templateId === "" ||
                      filterOptions.templateId === "all") &&
                    filterOptions.cpuCount === 1 &&
                    filterOptions.memory === 512 ? (
                      <SandboxNoData
                        tips={
                          <div className="flex flex-col items-center">
                            <div className="font-h5 text-[var(--dark-2)] mt-12 mb-2">
                              {"No Sandboxes yet"}
                            </div>
                            <div className="font-subtle text-[var(--dark-2)] mb-4">
                              Running Sandboxes can be observed here
                            </div>
                            <div>
                              <Button
                                className="h-8 mb-4 bg-[var(--dark-1)] text-[var(--white)] hover:bg-[var(--dark-2)]"
                                onClick={() => {
                                  window.open(
                                    DOCS_URL.CREATE_SANDBOX,
                                    "_blank",
                                  );
                                }}
                              >
                                Create a Sandbox{" "}
                                <img
                                  src="/sandbox/console/up-right.svg"
                                  alt="arrow-right"
                                  className="w-4 h-4 ml-1"
                                />
                              </Button>{" "}
                            </div>
                          </div>
                        }
                      />
                    ) : (
                      <NoData />
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </Table>
        {!loading && dataList.length !== 0 && (
          <StandardPagination
            className="mt-8"
            total={dataList.length}
            pageSize={pageSize}
            defaultCurrent={filterOptions.currentPage}
            onChange={(page) => handleChange({ currentPage: page })}
          />
        )}
      </div>
    </div>
  );
}
