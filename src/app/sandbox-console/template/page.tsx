"use client";

import { SearchInput } from "@/components/ui/input";
import styles from "../page.module.scss";
import templateStyles from "./page.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reqSandboxTemplateList } from "@/api/sandbox";
import { sliceUTCString } from "@/lib/utils/date";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { Input as AntInput } from "@/components/ui/input";
import { copyText } from "@/lib/utils/utils";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import debounce from "lodash.debounce";

function createVisibilityOptions() {
  return [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Public",
      value: "public",
    },
    {
      label: "Private",
      value: "private",
    },
  ];
}
const pageSize = 10;

export default function Page() {
  const visibilityOptions = createVisibilityOptions();
  const [filterOptions, setFilterOptions] = useState<any>({
    name: "",
    templateId: "",
    visibility: "all",
    cpuCount: 1,
    memory: 512,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [dataList, setDataList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const searchTemplate = useCallback(async () => {
    setLoading(true);
    const search = (filterOptions.name || "").trim();
    const minCpuCount = Number(filterOptions.cpuCount);
    const minMemoryMB = Number(filterOptions.memory);
    const templateType = "all";
    const showOfficial = true;
    const isPublic =
      filterOptions.visibility === "all"
        ? undefined
        : filterOptions.visibility === "public"
          ? true
          : false;
    const params =
      "undefined" === typeof isPublic
        ? {
            page: filterOptions.currentPage,
            pageSize,
            search,
            minCpuCount,
            minMemoryMB,
            templateType,
            showOfficial,
          }
        : {
            page: filterOptions.currentPage,
            pageSize,
            search,
            minCpuCount,
            minMemoryMB,
            templateType,
            showOfficial,
            isPublic,
          };
    reqSandboxTemplateList(params)
      .then((res: any) => {
        const templates = (res?.templates || []).map((ele: any) => ({
          ...ele,
          aliases: [ele.alias || ""],
          isOfficial: !!ele.isOfficial,
        }));
        setDataList(templates);
        const backendTotal = res?.total ?? res?.pagination?.total;
        const totalNum =
          typeof backendTotal === "number"
            ? backendTotal
            : Number(backendTotal) || templates.length;
        setTotal(Number.isNaN(totalNum) ? templates.length : totalNum);
      })
      .catch(() => {
        setDataList([]);
        setTotal(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    filterOptions.currentPage,
    filterOptions.name,
    filterOptions.visibility,
    filterOptions.cpuCount,
    filterOptions.memory,
  ]);

  useEffect(() => {
    searchTemplate();
  }, [searchTemplate]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "Template ID",
        header: "Template ID",
        className: "min-w-[120px] md:min-w-[150px] xl:min-w-[200px]",
        render: (row: any) => {
          if (row.templateID) {
            return (
              <Tooltip title={<div>{"Click to copy"}</div>}>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    copyText(row.templateID);
                  }}
                >
                  {row.templateID}
                </span>
              </Tooltip>
            );
          } else {
            return row.templateID;
          }
        },
      },
      {
        accessorKey: "Template Name",
        header: "Template Name",
        className: "min-w-[120px] md:min-w-[190px] xl:min-w-[200px]",
        render: (row: any) => {
          if (row.aliases && row.aliases.length > 0) {
            return (
              <span className="flex flex-row items-center gap-1">
                <span className="font-table-item text-[var(--dark-1)]">
                  {row.aliases[0]}
                </span>
                {row.isOfficial && (
                  <Tooltip title="This template is provided by Novita AI and is available to all users by default.">
                    <img
                      src="/sandbox/console/publicTip.svg"
                      alt="publicTip"
                      className="w-4 h-4"
                    />
                  </Tooltip>
                )}
              </span>
            );
          } else {
            return row.isOfficial ? (
              <Tooltip title="This template is provided by Novita AI and is available to all users by default.">
                <img
                  src="/sandbox/console/publicTip.svg"
                  alt="publicTip"
                  className="w-4 h-4"
                />
              </Tooltip>
            ) : (
              ""
            );
          }
        },
      },
      {
        accessorKey: "CPU Count",
        header: "CPU Count",
        className: "min-w-[120px] md:min-w-[150px] xl:min-w-[200px]",
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
        header: "Memory",
        className: "min-w-[120px] md:min-w-[110px] xl:min-w-[200px]",
        render: (row: any) => {
          return (
            <span>
              <span className="text-[var(--brand-1)]">{row.memoryMB} </span>
              <span className="text-[var(--black)]">MiB</span>
            </span>
          );
        },
      },
      {
        accessorKey: "Created At",
        header: "Created At",
        className: "min-w-[120px] md:min-w-[150px] xl:min-w-[200px]",
        render: (row: any) => {
          return sliceUTCString(
            new Date(row.createdAt).toUTCString(),
            "minute",
          );
        },
      },
      {
        accessorKey: "Updated At",
        header: "Updated At",
        className: "min-w-[120px] md:min-w-[150px] xl:min-w-[200px]",
        render: (row: any) => {
          return sliceUTCString(
            new Date(row.updatedAt).toUTCString(),
            "minute",
          );
        },
      },
      {
        accessorKey: "Visibility",
        header: "Visibility",
        className: "min-w-[120px] md:min-w-[100px] xl:min-w-[120px]",
        render: (row: any) => (row.public ? "Public" : "Private"),
      },
    ],
    [],
  );

  const handleChange = useCallback((obj: Partial<any>) => {
    setFilterOptions((prevOptions: any) => ({
      ...prevOptions,
      ...obj,
    }));
  }, []);

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
      }, 1000),
    [handleChange],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-2 flex-wrap">
        <SearchInput
          className={`h-8 rounded-[6px] w-[300px] target:border-[var(--dark-1)] ${styles.input}`}
          placeholder="Find a Template"
          style={{ maxWidth: 300 }}
          onSearch={(value) => {
            console.log(value);
            handleChange({ currentPage: 1, name: value });
            analytics.trackClick(
              CLICK_BTN_IDs.SANDBOX_CONSOLE.TEMPLATE_FILTER,
              {
                name: value,
              },
            );
          }}
        />
        <div>
          <span className="bg-[var(--brand-2)] rounded-[4px] border !border-[var(--brand-1)] px-[6px] py-1 flex items-center gap-1">
            <img src="/sandbox/console/dot.svg" alt="dot" className="w-1 h-1" />
            <span className="font-small-console text-[var(--brand-1)]">
              {total}
            </span>
            <span className="font-small-console text-[var(--dark-1)]">
              Template
            </span>
          </span>
        </div>
      </div>
      <div className="flex flex-row items-end gap-2 flex-wrap">
        <div>
          <p
            className={`${styles.filter_label} flex flex-row items-center gap-1 justify-between`}
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
                    CLICK_BTN_IDs.SANDBOX_CONSOLE.TEMPLATE_FILTER,
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
                  CLICK_BTN_IDs.SANDBOX_CONSOLE.TEMPLATE_FILTER,
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
            className={`${styles.filter_label} flex flex-row items-center gap-1 justify-between`}
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
                      CLICK_BTN_IDs.SANDBOX_CONSOLE.TEMPLATE_FILTER,
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
                      CLICK_BTN_IDs.SANDBOX_CONSOLE.TEMPLATE_FILTER,
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
              className="absolute right-[36px] font-subtle-medium text-[var(--dark-5)] top-[8px] bg-[var(--white)]"
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
                  CLICK_BTN_IDs.SANDBOX_CONSOLE.TEMPLATE_FILTER,
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
        <div>
          <p className={styles.filter_label}>Visibility</p>

          <Select
            value={filterOptions.category}
            onValueChange={(value) => {
              console.log(value);
              handleChange({
                currentPage: 1,
                visibility: value,
              });
              analytics.trackClick(
                CLICK_BTN_IDs.SANDBOX_CONSOLE.TEMPLATE_FILTER,
                {
                  visibility: value,
                },
              );
            }}
          >
            <SelectTrigger className="w-[180px] h-8 text-groupbtn-foreground font-subtle text-[var(--dark-1)]">
              <SelectValue placeholder={"All"} />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((type, index) => (
                <SelectItem value={type.value} key={index}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        className={`bg-white rounded-[6px] border border-[var(--gray-2)] px-4 py-2 ${templateStyles.template_table_container}`}
      >
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
          {!loading && dataList.length > 0 && (
            <TableBody>
              {dataList.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column, index) => {
                    const accessorKey = columns[index]
                      .accessorKey as keyof typeof row;
                    return (
                      <TableCell
                        key={column.accessorKey}
                        className={styles.table_cell}
                      >
                        {column.render ? column.render(row) : row[accessorKey]}
                      </TableCell>
                    );
                  })}
                </TableRow>
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
                <td colSpan={columns.length} className="w-full col-span-full">
                  <div className="w-full !flex justify-center items-center">
                    <div className="min-h-[300px] flex flex-col justify-center items-center">
                      <NoData />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </Table>
        {!loading && total > 0 && (
          <StandardPagination
            className="mt-8"
            total={total}
            pageSize={pageSize}
            defaultCurrent={filterOptions.currentPage}
            onChange={(page) => handleChange({ currentPage: page })}
          />
        )}
      </div>
    </div>
  );
}
