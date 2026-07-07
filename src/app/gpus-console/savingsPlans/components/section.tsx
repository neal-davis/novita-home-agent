"use client";

import styles from "./section.module.scss";
import { useEffect, useState, useCallback } from "react";
import { SearchInput } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { reqGetSavingPlans } from "@/api/gpu-instance/savingsPlans";
import { sliceUTCString } from "@/lib/utils/date";
import {
  MyTablePagination,
  MyPagination,
  PaginationItem,
} from "@/app/gpus-console/components/myPagination";
import { useI18n } from "@/i18n/provider";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";

export default function Section() {
  const { locale } = useI18n();
  const [params, setParams] = useState<any>({
    pageNo: 1,
    pageSize: 10,
    productName: "",
  });
  const [tableData, setTableData] = useState<any>({
    savingPlanList: [],
    total: 0,
  });
  const getTableData = useCallback(
    (pageNo?: number, pageSize?: number, paramObj?: any) => {
      reqGetSavingPlans({
        ...params,
        ...paramObj,
        pageNo: pageNo || params.pageNo,
        pageSize: pageSize || params.pageSize,
      }).then((res: any) => {
        setTableData({
          savingPlanList: res?.data || [],
          total: res?.total || 0,
        });
      });
    },
    [params],
  );
  useEffect(() => {
    getTableData(1);
  }, [getTableData]);

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setParams({ ...params, pageSize: parseInt(event.target.value, 10) });
    getTableData(1, parseInt(event.target.value, 10));
  }
  function changePage(event: any, page: number) {
    setParams({ ...params, pageNo: page });
    getTableData(page);
  }
  const toExplore: any = (
    <span
      className={styles.linkAction}
      onClick={() => {
        window.location.href = getLocalizedPath(
          NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE,
          locale,
        );
      }}
    >
      To Explore
    </span>
  );
  function isTimeLater(originTime: number, targetTime: number) {
    return originTime >= targetTime;
  }

  const handleProductNameSearch = useCallback(
    (value: string) => {
      setParams({ ...params, productName: value, pageNo: 1 });
      getTableData(1, params.pageSize, { productName: value });
    },
    [getTableData, params],
  );

  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <div className={styles.filterLine}>
          <span className={styles.searchArea}>
            <SearchInput
              className="h-8 w-full"
              placeholder="Filter by GPU Type"
              value={params.productName}
              onSearch={handleProductNameSearch}
            />
          </span>
          <span
            className={`${styles.linkAction} ${styles.helpLink}`}
            // onClick={() =>
            //   window.open('https://docs.infrai.com/billing/billing-methods')
            // }
          >
            What are savings plans?
          </span>
        </div>

        <div>
          <div className={styles.tableCard}>
            <div className={styles.tableCardHeader}>
              <span className={styles.tableCardTitle}>Savings Plans</span>
            </div>
            <div className={styles.tableCardBody}>
              <div className={styles.tableContent}>
                <div className={`w-full overflow-auto ${styles.tableScroll}`}>
                  <Table className={styles.table} aria-label="caption table">
                    <TableHeader className={styles.tableHeader}>
                      <TableRow>
                        <TableHead>
                          <span className={styles.rowTitle}>
                            SAVINGS PLAN ID
                          </span>
                        </TableHead>
                        <TableHead>
                          <span className={styles.rowTitle}>GPU TYPES</span>
                        </TableHead>
                        <TableHead>
                          <span className={styles.rowTitle}>INSTANCE NAME</span>
                        </TableHead>
                        <TableHead>
                          <span className={styles.rowTitle}>INSTANCE ID</span>
                        </TableHead>
                        <TableHead>
                          <span className={styles.rowTitle}>REGION</span>
                        </TableHead>
                        <TableHead>
                          <span className={styles.rowTitle}>UTILIZATION</span>
                        </TableHead>
                        <TableHead>
                          <span className={styles.rowTitle}>
                            TOTAL COMMITMENT
                          </span>
                        </TableHead>
                        <TableHead>
                          <span className={styles.rowTitle}>EXPIRE TIME</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData?.savingPlanList?.map((row: any) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.id}</TableCell>
                          <TableCell>{row.productName}</TableCell>
                          <TableCell>
                            {row.instanceId
                              ? row.instanceName
                              : isTimeLater(
                                    new Date().getTime(),
                                    Number(
                                      isNaN(row.expireTime)
                                        ? 0
                                        : row.expireTime,
                                    ) * 1000,
                                  )
                                ? ""
                                : toExplore}
                          </TableCell>
                          <TableCell>
                            {row.instanceId
                              ? row.instanceId
                              : isTimeLater(
                                    new Date().getTime(),
                                    Number(
                                      isNaN(row.expireTime)
                                        ? 0
                                        : row.expireTime,
                                    ) * 1000,
                                  )
                                ? ""
                                : toExplore}
                          </TableCell>
                          <TableCell>{row.regionName}</TableCell>
                          <TableCell>
                            {isNaN(row.utilization)
                              ? ""
                              : Math.round(Number(row.utilization) * 10000) /
                                  100 +
                                "%"}
                          </TableCell>
                          <TableCell>
                            ${Math.round(Number(row.amount) / 100)}
                          </TableCell>
                          <TableCell>
                            {row.expireTime
                              ? sliceUTCString(
                                  new Date(row.expireTime * 1000).toUTCString(),
                                  "hour",
                                )
                              : "/"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {!!tableData?.total && (
                  <div className={styles.pagination}>
                    <MyTablePagination
                      count={0}
                      onPageChange={() => {}}
                      page={1}
                      className={styles.tablePagination}
                      rowsPerPage={params.pageSize}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <MyPagination
                      className={styles.paginationInner}
                      page={params.pageNo}
                      count={
                        Math.floor(Number(tableData.total / params.pageSize)) +
                        (Math.round(tableData.total % params.pageSize) === 0
                          ? 0
                          : 1)
                      }
                      // count={2}
                      onChange={changePage}
                      renderItem={(item: any) => {
                        return (
                          <PaginationItem
                            to={`/inbox${
                              item.page === 1 ? "" : `?page=${item.page}`
                            }`}
                            {...item}
                          />
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
