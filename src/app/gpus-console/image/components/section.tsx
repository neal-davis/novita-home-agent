"use client";

import { Button } from "@/components/ui/button";
import styles from "./section.module.scss";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input, SearchInput } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useRef, useState } from "react";
import { reqGpuStorageBaseInfo } from "@/api/gpu-instance/storage";
import {
  reqGpuImagePrewarm,
  // reqDeleteGpuImagePrewarm,
  reqEditGpuImagePrewarm,
  reqGpuImagePrewarmQuota,
} from "@/api/gpu-instance/images";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { ProgressCircle } from "@/components/ui/standard/progress";
import { NoData } from "@/components/ui/standard/no-data";
import { CascadeFilter } from "@/components/ui/standard/cascade-filter";
import Modal from "@/app/components/Modal/Modal";
import AddImagePrewarmJob from "./addImagePrewarmJob";
import { DOCS_URL, SUPPORT_EMAIL_LINK } from "@/constants/urls";
import { sliceUTCString } from "@/lib/utils/date";
import JobState from "./jobState";
import {
  MyTablePagination,
  MyPagination,
  PaginationItem,
} from "@/app/gpus-console/components/myPagination";
import DeleteImagePrewarmJob from "./deleteImagePrewarmJob";
import AddTemplateInPrewarm from "@/app/gpus-console/components/addTemplateInPrewarm";
import { useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";

const MyModal = Modal;
const CurrModal = Modal;
function createStateList() {
  return [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "Pending" },
    { label: "Running", value: "Running" },
    { label: "Succeeded", value: "Succeeded" },
    { label: "Failed", value: "Failed" },
  ];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1));

  const displayValue = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

  return `${displayValue} ${sizes[i]}`;
}

export default function Section() {
  const stateList = createStateList();
  const hasAddImagePrewarmPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.image,
    resource: PERMISSION.RESOURCE.image_prewarm,
    action: PERMISSION.ACTION.create,
  });
  const hasUpdateImagePrewarmPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.image,
    resource: PERMISSION.RESOURCE.image_prewarm,
    action: PERMISSION.ACTION.update,
  });
  const hasDeleteImagePrewarmPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.image,
    resource: PERMISSION.RESOURCE.image_prewarm,
    action: PERMISSION.ACTION.delete,
  });
  const hasAddTemplatePermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.template,
    resource: PERMISSION.RESOURCE.template,
    action: PERMISSION.ACTION.create,
  });
  const searchParams = useSearchParams();
  const [regions, setRegions] = useState<any[]>([]);
  const [continents, setContinents] = useState<any[]>([]);
  const [tooltipInfo, setTooltipInfo] = useState<any>({
    total: "-",
    limit: "-",
    perImageSize: "",
  });
  const [dataInfo, setDataInfo] = useState<{ total: number; data: any[] }>({
    total: 0,
    data: [],
  });

  const [params, setParams] = useState({
    page: 1,
    pageSize: 10,
    state: "",
    clusterId: "",
    name: "",
  });
  const [batchMode, setBatchMode] = useState(false);
  const [batSelectedIds, setBatSelectedIds] = useState<any[]>([]);
  const paramsRef = useRef(params);
  const batchModeRef = useRef(batchMode);
  const batSelectedIdsRef = useRef(batSelectedIds);

  paramsRef.current = params;
  batchModeRef.current = batchMode;
  batSelectedIdsRef.current = batSelectedIds;

  const getImagePrewarmList = useCallback(
    (page?: number, pageSize?: number, paramObj?: any) => {
      const currentParams = paramsRef.current;
      reqGpuImagePrewarm({
        ...currentParams,
        page: page || currentParams.page,
        pageSize: pageSize || currentParams.pageSize,
        ...paramObj,
      }).then((res) => {
        const total = res?.total || 0;
        const data = res?.data || [];
        setDataInfo({ total, data });
        if (batchModeRef.current) {
          if (data.length === 0) {
            setBatSelectedIds([]);
          } else {
            const newBatSelectedIds: any[] = [];
            const selectedIdSet = new Set(batSelectedIdsRef.current);
            for (let i = 0; i < data.length; i++) {
              const item = data[i];
              if (selectedIdSet.has(item.id)) {
                newBatSelectedIds.push(item.id);
              }
            }
            setBatSelectedIds(newBatSelectedIds);
          }
        }
      });
    },
    [],
  );

  const getImagePrewarmQuota = useCallback(() => {
    reqGpuImagePrewarmQuota({}).then((res) => {
      setTooltipInfo({
        total: res?.total || res?.total === 0 ? res?.total : "-",
        limit: res?.limit || res?.limit === 0 ? res?.limit : "-",
        perImageSize:
          res?.perImageSize || res?.perImageSize === 0
            ? res?.perImageSize
            : "-",
      });
    });
  }, []);

  useEffect(() => {
    reqGpuStorageBaseInfo({}).then((res) => {
      const regionsTmp = (res?.clusters || []).filter(
        (item: any) => item.version === "v2",
      );
      setRegions(regionsTmp);
      let continentsTmp = regionsTmp.map((item: any) => item.continent);
      continentsTmp = [...new Set(continentsTmp)];
      setContinents(continentsTmp);
    });
  }, []);

  useEffect(() => {
    getImagePrewarmList();
    getImagePrewarmQuota();
  }, [getImagePrewarmList, getImagePrewarmQuota]);

  const handleImageSearch = useCallback(
    (value: string) => {
      setParams({ ...params, name: value, page: 1 });
      getImagePrewarmList(1, params.pageSize, { name: value });
    },
    [getImagePrewarmList, params],
  );

  const [showAddImagePrewarmJob, setShowAddImagePrewarmJob] = useState({
    showModal: false,
    imageUrl: "",
    regions: [] as any[],
  });
  useEffect(() => {
    const prewarm = searchParams.get("prewarm");
    const imageId = searchParams.get("imageId");

    if (prewarm === "1" && imageId) {
      setShowAddImagePrewarmJob((prev) => ({
        ...prev,
        showModal: true,
        imageUrl: imageId,
      }));

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("prewarm");
      newSearchParams.delete("imageId");
      const newUrl = `${window.location.pathname}${
        newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""
      }`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);
  function finishAddImagePrewarmJob(isSuccess?: boolean) {
    setShowAddImagePrewarmJob({
      ...showAddImagePrewarmJob,
      imageUrl: "",
      showModal: false,
    });
    if (isSuccess) {
      getImagePrewarmList();
      getImagePrewarmQuota();
    }
  }
  // function removeImagePrewarmJob(id: string) {
  //   reqDeleteGpuImagePrewarm({
  //     ids: [id],
  //   }).then(() => {
  //     message.success("删除成功");
  //     setParams({ ...params, page: 1 });
  //     getImagePrewarmList(1);
  //     getImagePrewarmQuota();
  //   });
  // }
  const [updateNoteInfo, setUpdateNoteInfo] = useState({
    showModal: false,
    id: "",
    note: "",
  });
  function updateNoteFun() {
    if (updateNoteInfo.note.trim().length > 100) {
      message.error("Remarks length cannot exceed 100 characters");
      return;
    }
    reqEditGpuImagePrewarm({
      id: updateNoteInfo.id,
      note: updateNoteInfo.note.trim(),
    }).then(() => {
      message.success("Operation successful");
      getImagePrewarmList();
      getImagePrewarmQuota();
    });
    setUpdateNoteInfo({ ...updateNoteInfo, showModal: false });
  }
  const [showDeleteImagePrewarmJob, setShowDeleteImagePrewarmJob] = useState({
    showModal: false,
    ids: [] as any[],
  });
  function finishDeleteImagePrewarmJob(isSuccess?: boolean) {
    setShowDeleteImagePrewarmJob({
      ...showDeleteImagePrewarmJob,
      showModal: false,
    });
    if (isSuccess) {
      if (batchMode) {
        setBatSelectedIds([]);
      }
      setBatchMode(false);
      getImagePrewarmList();
      getImagePrewarmQuota();
    }
  }
  const timerHandler = useRef<any>(null);

  useEffect(() => {
    timerHandler.current = setInterval(() => {
      getImagePrewarmList();
    }, 3000);
    return () => {
      clearInterval(timerHandler.current);
    };
  }, [getImagePrewarmList]);

  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setParams({ ...params, pageSize: parseInt(event.target.value, 10) });
    getImagePrewarmList(1, parseInt(event.target.value, 10));
  }

  function changeTransationsPage(event: any, page: number) {
    setParams({ ...params, page: page });
    getImagePrewarmList(page);
  }
  const [saveTemplateInfo, setSaveTemplateInfo] = useState({
    showModal: false,
    imageUrl: "",
    authId: "",
  });
  function finishFormSaveTemplate(isSuccess?: boolean) {
    setSaveTemplateInfo({
      ...saveTemplateInfo,
      showModal: false,
    });
    if (isSuccess) {
      message.success("Operation successful");
    }
  }

  return (
    <div>
      <div className="font-small-console-medium text-[var(--dark-1)] mb-[16px]">
        Prewarmed images are free of storage charges, but{" "}
        <span
          className="h-auto text-[var(--brand-0)] cursor-pointer hover:underline bg-transparent border-0 p-0 cursor-pointer"
          onClick={() => window.open(DOCS_URL.GPU_INSTANCE_FEE, "_blank")}
        >
          standard storage fees
        </span>{" "}
        apply when creating instances.{" "}
        <span
          className="h-auto text-[var(--brand-0)] cursor-pointer hover:underline bg-transparent border-0 p-0 cursor-pointer"
          onClick={() => window.open(DOCS_URL.IMAGE_PRE_WARM, "_blank")}
        >
          View the help docs
        </span>
        .
      </div>
      <div className="flex justify-between items-center mb-[16px]">
        <div className="flex items-center gap-[12px]">
          {hasAddImagePrewarmPermission &&
            (!isNaN(Number(tooltipInfo.limit)) &&
            !isNaN(Number(tooltipInfo.total)) &&
            Number(tooltipInfo.total) >= Number(tooltipInfo.limit) ? (
              <Tooltip
                title={
                  <div className="font-small text-[var(--dark-2)]">
                    <div>
                      The number of image prewarm tasks has reached the limit (
                      {tooltipInfo.limit}).
                    </div>
                    <div>
                      Please remove some tasks before retrying, or contact
                      technical support for assistance.
                    </div>
                  </div>
                }
                placement="top"
              >
                <div className="cursor-not-allowed">
                  <Button
                    disabled={true}
                    variant="secondary"
                    onClick={() =>
                      setShowAddImagePrewarmJob({
                        ...showAddImagePrewarmJob,
                        showModal: true,
                        regions: regions,
                      })
                    }
                    className="h-[32px]"
                  >
                    Create Image Prewarm Task
                  </Button>
                </div>
              </Tooltip>
            ) : (
              <Button
                variant="secondary"
                onClick={() =>
                  setShowAddImagePrewarmJob({
                    ...showAddImagePrewarmJob,
                    showModal: true,
                    regions: regions,
                  })
                }
                className="h-[32px]"
              >
                Create Image Prewarm Task
              </Button>
            ))}
          <div className="flex items-center gap-[4px]">
            <ProgressCircle
              trailColor="var(--gray-1)"
              strokeColor="var(--brand-0)"
              percent={Math.round(
                (tooltipInfo.total / tooltipInfo.limit) * 100,
              )}
              strokeWidth={3}
              size={15}
            />
            <div className="font-small-console">
              <span className="text-[var(--brand-0)]">{tooltipInfo.total}</span>
              <span className="text-[var(--black)]">/{tooltipInfo.limit}</span>
              <span className="ml-[4px] text-[var(--black)]">
                Image prewarming tasks created, Each up to
              </span>
              <span className="ml-[4px] font-small-console-medium text-[var(--dark-1)]">
                {tooltipInfo.perImageSize}GB
              </span>
            </div>
            <Tooltip
              title={
                <div className="font-small-small text-[var(--dark-1)]">
                  <div>For additional tasks,</div>
                  <div>
                    Please{" "}
                    <Link
                      style={{
                        fontSize: "12px",
                        color: "var(--brand-0)",
                      }}
                      href={`mailto:${SUPPORT_EMAIL_LINK}`}
                      className={`py-[8px] hover:underline`}
                      target={"_blank"}
                    >
                      contact our technical support team.
                    </Link>
                  </div>
                </div>
              }
            >
              <Image
                src="/gpu-instance/images/help.svg"
                alt="help"
                width={16}
                height={16}
                className="w-[16px] h-[16px]"
              />
            </Tooltip>
          </div>
        </div>
        <div className={`flex items-center gap-[8px] ${styles.cascader}`}>
          <SearchInput
            className="h-8 w-[200px]"
            placeholder="Image Name/Remarks"
            value={params.name}
            onSearch={handleImageSearch}
          />
          <CascadeFilter<string, any>
            {...{
              parents: continents,
              childOptions: regions,
              value: params.clusterId,
              onValueChange: (value) => {
                setParams({ ...params, clusterId: value });
                getImagePrewarmList(1, params.pageSize, {
                  clusterId: value,
                });
              },
              onClear: () => {
                setParams({ ...params, clusterId: "" });
                getImagePrewarmList(1, params.pageSize, {
                  clusterId: "",
                });
              },
              allowClear: true,
              getParentValue: (continent) => continent,
              getParentLabel: (continent) => continent,
              getChildValue: (region) => region.id,
              getChildLabel: (region) => region.name,
              getChildParentValue: (region) => region.continent,
              // i18n-disable-next-line
              triggerClassName: "h-[32px] w-[220px]",
              // i18n-disable-next-line
              placeholder: "Region",
            }}
          />
          <Select
            onValueChange={(value) => {
              setParams({
                ...params,
                state: value === "all" ? "" : value,
                page: 1,
              });
              getImagePrewarmList(1, params.pageSize, {
                state: value === "all" ? "" : value,
              });
            }}
          >
            <SelectTrigger className="w-[120px] h-[34px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              {stateList.map((item: any) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {hasDeleteImagePrewarmPermission && dataInfo.data.length > 0 && (
        <div className="flex justify-start mb-[8px] gap-[8px]">
          {!batchMode && (
            <Button
              onClick={() => {
                if (!batchMode) {
                  setBatSelectedIds([]);
                }
                setBatchMode(true);
              }}
              variant={"outline"}
              className="h-[32px]"
            >
              Batch Operation
            </Button>
          )}
          {/* <Button variant={"outline"} className="h-[34px]" style={{
          border: "1px solid var(--brand-4)",
          background: "var(--brand-7)",
        }}>
          <span className="text-[var(--brand-0)]">Batch Operation</span>
        </Button> */}
          {batchMode && (
            <>
              <Button
                variant="default"
                className="h-[32px]"
                onClick={() => {
                  if (batSelectedIds.length === 0) {
                    message.error("Please select the data to be deleted.");
                    return;
                  }
                  setShowDeleteImagePrewarmJob({
                    ...showDeleteImagePrewarmJob,
                    showModal: true,
                    ids: batSelectedIds,
                  });
                }}
              >
                Confirm Delete
              </Button>
              <Button
                variant={"outline"}
                className="h-[32px]"
                onClick={() => {
                  if (batchMode) {
                    setBatSelectedIds([]);
                  }
                  setBatchMode(false);
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )}
      <div className="flex flex-col gap-[8px]">
        {dataInfo.data.map((item: any) => (
          <div className={styles.itemContainer} key={item.id}>
            <div className="flex items-center gap-[8px] w-[40%]">
              {batchMode && (
                // <div>
                <Checkbox
                  // className={styles.checkbox}
                  checked={batSelectedIds.includes(item.id)}
                  onCheckedChange={(checked: boolean) => {
                    if (checked) {
                      setBatSelectedIds([...batSelectedIds, item.id]);
                    } else {
                      setBatSelectedIds(
                        batSelectedIds.filter((id: any) => id !== item.id),
                      );
                    }
                  }}
                />
                // </div>
              )}
              <div className="w-full">
                <div className="mb-[6px]">
                  <span className="font-subtle-medium text-[var(--black)] mr-[8px]">
                    {item.imageName}
                  </span>
                  <span className="font-small-console text-[var(--dark-2)] break-all">
                    (Remarks: {item.note}
                    {hasUpdateImagePrewarmPermission && (
                      <Button
                        type="button"
                        variant="noborderghost"
                        size="icon"
                        aria-label="Edit image prewarm remark"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          setUpdateNoteInfo({
                            showModal: true,
                            id: item.id,
                            note: item.note,
                          });
                        }}
                        className={`iconfont icon-pencil-line cursor-pointer text-[var(--dark-2)] hover:text-[var(--brand-0)] bg-transparent border-0 p-0`}
                        style={{
                          width: "12px",
                          height: "12px",
                          fontSize: "12px",
                          marginLeft: "4px",
                          marginBottom: "2px",
                        }}
                      />
                    )}
                    )
                  </span>
                </div>

                <div className="font-small-console text-[var(--dark-2)]">
                  Task ID: {item.id}
                </div>
                <div className="font-small-console text-[var(--dark-2)] break-all">
                  Image: {item.imageUrl}
                </div>
              </div>
            </div>
            <div className="min-w-[340px]">
              <div className="mb-[6px]">
                <span className="font-small-console text-[var(--dark-1)] mr-[8px]">
                  {" "}
                </span>
              </div>

              <div className="font-small-console text-[var(--dark-2)]">
                Image Size: {formatBytes(item.imageSize)}
              </div>
              <div className="font-small-console text-[var(--dark-2)]">
                {item.products?.length > 0
                  ? `Region/ GPU type: ${item.clusterName} - ${
                      item.products[0]?.productName || "/"
                    }`
                  : `Region/ GPU type: ${item.clusterName}`}
                {item.products?.length > 1 && (
                  <Tooltip
                    title={item.products
                      ?.map((product: any) => product.productName)
                      .join(", ")}
                  >
                    <span className="ml-1 cursor-pointer">...</span>
                  </Tooltip>
                )}
              </div>
            </div>
            <div
              className={`flex flex-row ${
                !hasDeleteImagePrewarmPermission && !hasAddTemplatePermission
                  ? "justify-end"
                  : "justify-between"
              } gap-[19px] min-w-[340px]`}
            >
              <div>
                <div className="mb-[4px] text-right">
                  <JobState state={item.state} reason={item.reason} />
                </div>

                <div className="font-small-console text-[var(--dark-2)]">
                  Creation Time:{" "}
                  {item.createTime && item.createTime !== "0"
                    ? sliceUTCString(
                        new Date(Number(item.createTime) * 1000).toUTCString(),
                        "second",
                      )
                    : "-"}
                </div>
                <div className="font-small-console text-[var(--dark-2)]">
                  {"Completion Time: " +
                    (item.completeTime && item.completeTime !== "0"
                      ? sliceUTCString(
                          new Date(
                            Number(item.completeTime) * 1000,
                          ).toUTCString(),
                          "second",
                        )
                      : "-")}
                </div>
              </div>
              {(hasDeleteImagePrewarmPermission ||
                hasAddTemplatePermission) && (
                <div className="flex flex-col mt-[6px] gap-[8px]">
                  {hasAddTemplatePermission && (
                    <Button
                      size="sm"
                      className="h-[24px] font-small"
                      variant="outline"
                      onClick={() => {
                        setSaveTemplateInfo({
                          ...saveTemplateInfo,
                          showModal: true,
                          imageUrl: item.imageUrl,
                          authId: item.repositoryAuth,
                        });
                      }}
                    >
                      Save as Template
                    </Button>
                  )}
                  {hasDeleteImagePrewarmPermission && (
                    <Button
                      size="sm"
                      className="h-[24px] font-small"
                      variant="outline"
                      onClick={() => {
                        setShowDeleteImagePrewarmJob({
                          ...showDeleteImagePrewarmJob,
                          showModal: true,
                          ids: [item.id],
                        });
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {!dataInfo.total ? (
          <div style={{ marginTop: "150px" }}>
            <NoData title="No Data" />
          </div>
        ) : (
          ""
        )}
        {!!dataInfo.total && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexWrap: "nowrap",
            }}
          >
            <MyTablePagination
              count={0}
              onPageChange={(e: any) => {}}
              page={1}
              style={{ border: "none" }}
              rowsPerPage={params.pageSize}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rows per page"
            />
            <MyPagination
              style={{ display: "inline-block", color: "var(--dark-1)" }}
              page={params.page}
              count={
                Math.floor(Number(dataInfo.total / params.pageSize)) +
                (Math.round(dataInfo.total % params.pageSize) === 0 ? 0 : 1)
              }
              // count={2}
              onChange={changeTransationsPage}
              renderItem={(item: any) => {
                return <PaginationItem {...item} />;
              }}
            />
          </div>
        )}
      </div>

      {showDeleteImagePrewarmJob.showModal ? (
        <MyModal
          centered
          width="min(560px, calc(100vw - 32px))"
          footer={null}
          open={showDeleteImagePrewarmJob.showModal}
          title={"Delete Confirmation"}
          onCancel={() => finishDeleteImagePrewarmJob(false)}
          className={styles.editModal}
        >
          <DeleteImagePrewarmJob
            ids={showDeleteImagePrewarmJob.ids}
            finishForm={(isSuccess: boolean) =>
              finishDeleteImagePrewarmJob(isSuccess)
            }
          />
        </MyModal>
      ) : (
        ""
      )}
      {saveTemplateInfo.showModal ? (
        <AddTemplateInPrewarm
          mode={"Create"}
          imageUrl={saveTemplateInfo.imageUrl}
          authId={saveTemplateInfo.authId}
          finishForm={finishFormSaveTemplate}
        />
      ) : (
        ""
      )}
      {updateNoteInfo.showModal ? (
        <CurrModal
          title={"Edit Remarks"}
          open={updateNoteInfo.showModal}
          onCancel={() =>
            setUpdateNoteInfo({ ...updateNoteInfo, showModal: false })
          }
          footer={[
            <Button
              key={1}
              variant="outline"
              className="h-[32px] w-[124px]"
              onClick={() => {
                setUpdateNoteInfo({ ...updateNoteInfo, showModal: false });
              }}
            >
              Cancel
            </Button>,
            <Button
              key={2}
              variant="default"
              className="h-[32px] w-[124px]"
              onClick={updateNoteFun}
            >
              Confirm
            </Button>,
          ]}
        >
          <Textarea
            className="min-h-[80px] w-full"
            placeholder={"Input Remarks"}
            value={updateNoteInfo.note}
            onChange={(e: any) =>
              setUpdateNoteInfo({ ...updateNoteInfo, note: e.target.value })
            }
          />
        </CurrModal>
      ) : (
        ""
      )}
      {showAddImagePrewarmJob.showModal ? (
        <MyModal
          {...{
            centered: true,
            width: "min(658px, calc(100vw - 32px))",
            footer: null,
            open: showAddImagePrewarmJob.showModal,
            title: "Create Image Prewarm Task",
            onCancel: () => finishAddImagePrewarmJob(false),
            className: styles.editModal,
            classNames: { header: styles.compactModalHeader },
          }}
        >
          <AddImagePrewarmJob
            tooltipInfo={tooltipInfo}
            regionList={showAddImagePrewarmJob.regions}
            imageUrl={showAddImagePrewarmJob.imageUrl}
            finishForm={(isSuccess: boolean) =>
              finishAddImagePrewarmJob(isSuccess)
            }
          />
        </MyModal>
      ) : (
        ""
      )}
    </div>
  );
}
