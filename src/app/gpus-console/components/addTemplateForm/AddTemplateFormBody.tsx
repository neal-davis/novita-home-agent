"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { SelectFilter } from "@/components/ui/standard/selectFilter";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { dealParamsText } from "@/lib/utils/utils";
import templateStyles from "../addTemplate/index.module.scss";

const MyMdEditor = dynamic(
  () => import("md-editor-rt").then((mod) => mod.MdEditor),
  { ssr: false },
);
const ADD_CREDENTIALS_OPTION_VALUE = "__add_credentials__";
const NO_CREDENTIALS_OPTION_VALUE = "__no_credentials__";
type AddTemplateBodyVariant = "default" | "prewarm";
export type AddTemplateFormBodyProps = {
  state: any;
  actions: any;
  options: any;
  errors: any;
  formStyles?: typeof templateStyles;
  variant?: AddTemplateBodyVariant;
};

// react-doctor-disable-next-line react-doctor/no-giant-component -- Preserves the legacy template form contract after moving the body out of the modal shell; deeper field-level extraction is follow-up work.
export default function AddTemplateBody({
  state,
  actions,
  options,
  errors,
  formStyles = templateStyles,
  variant = "default",
}: AddTemplateFormBodyProps) {
  const isPrewarm = variant === "prewarm";
  const imageRowMarginClassName = isPrewarm ? "mb-[8px]" : "mb-[24px]";
  const labelClassName = cn(
    "text-xs leading-3 font-normal",
    isPrewarm ? "mb-3" : "mb-1",
  );
  const fieldClassName = isPrewarm ? "mb-5" : "mb-6";
  const portsRowClassName = cn("flex", isPrewarm ? "mb-3" : "mb-6");
  const environmentClassName = isPrewarm ? "mb-[27px]" : "mb-6";
  const templateInputClassName =
    "h-9 w-full rounded-[8px] border border-[var(--gray-2)] px-5 py-[14px] text-sm text-[var(--black)]";
  const secondaryTemplateInputClassName =
    "h-9 w-full rounded-[8px] border border-[var(--gray-1)] px-5 py-[14px] text-sm text-[var(--dark-1)]";
  const multilineInputClassName =
    "flex h-auto min-h-[84px] w-full items-start overflow-hidden rounded-[8px] border border-[var(--gray-2)] px-5 py-[14px] text-sm text-[var(--black)]";
  const {
    alignment,
    templateInfo,
    showAddImageAuth,
    mode,
    imageInit,
    entrypointInit,
    rootfsSizeInit,
    showLocal,
    mountLocal,
    inputEnvInfo,
  } = state;
  const {
    setAlignment,
    changeItem,
    setShowAddImageAuth,
    setImageInit,
    setEntrypointInit,
    setMountLocal,
    removeEnv,
    addEnvs,
  } = actions;
  const { cudaVersions, myAuths, freeInfo } = options;
  const { imageError, entrypointError, rootfsSizeError, httpError, tcpError } =
    errors;
  const localRowClassName = showLocal ? "mb-2" : fieldClassName;
  const registryCredentialsField = (
    <div className={isPrewarm ? "w-full" : "inline-block w-[calc(50%_-_12px)]"}>
      <div className={labelClassName}>{"Container Registry Credentials"}</div>
      <div className="flex w-full flex-col gap-1">
        <SelectFilter
          {...{
            value:
              templateInfo.channel === "community"
                ? NO_CREDENTIALS_OPTION_VALUE
                : templateInfo.imageAuth || "",
            options: [
              ...(templateInfo.channel === "community"
                ? [
                    {
                      id: NO_CREDENTIALS_OPTION_VALUE,
                      name: "No Credentials",
                    },
                  ]
                : [
                    {
                      id: ADD_CREDENTIALS_OPTION_VALUE,
                      name: "+ Add Credentials",
                    },
                  ]),
              ...myAuths,
            ],
            onValueChange: (value) => {
              if (value === ADD_CREDENTIALS_OPTION_VALUE) {
                setShowAddImageAuth({
                  ...showAddImageAuth,
                  showModal: true,
                });
                return;
              }
              changeItem("imageAuth", {
                target: { value },
              });
            },
            onClear: () => changeItem("imageAuth"),
            allowClear:
              templateInfo.channel !== "community" && !!templateInfo.imageAuth,
            // i18n-disable-next-line
            clearAriaLabel: "Clear container registry credentials",
            disabled: templateInfo.channel === "community",
            getOptionValue: (item: any) => item.id,
            getOptionLabel: (item: any) => item.name,
            renderTrigger: (item: any) => (
              <span className="text-left text-sm leading-[14px] font-[350] not-italic text-[var(--black)]">
                {item?.name || "Container Registry Credentials"}
              </span>
            ),
            renderOption: (item: any) => item.name,
            // i18n-disable-next-line
            placeholder: "Container Registry Credentials",
            triggerClassName: `${formStyles.selectItem} ${
              templateInfo.channel === "community"
                ? //  ||
                  // (!templateInfo.isUsed && mode !== "Create")
                  formStyles.disabledSelectItem
                : ""
            }`,
            itemClassName: formStyles.menuItem,
            showSearch: false,
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className={`${formStyles.titleTab} mb-6`}>
        {[
          {
            title: "Config",
            iconName: "Config",
            value: "left",
          },
          {
            title: "README",
            iconName: "README",
            value: "right",
          },
        ].map((item) => (
          <button
            type="button"
            onClick={() => {
              setAlignment(item.value);
            }}
            className={`${formStyles.tabItem} ${
              alignment === item.value
                ? formStyles.active
                : formStyles.notActive
            }`}
            key={item.value}
          >
            <span
              className={
                alignment === item.value
                  ? formStyles.tabTitleActive
                  : formStyles.tabTitle
              }
            >
              {item.title}
            </span>
          </button>
        ))}
      </div>
      {alignment === "left" ? (
        <div>
          <div className={cn("flex gap-[8px]", fieldClassName)}>
            <div className="flex-1">
              <div className={labelClassName}>
                <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                  *
                </span>
                {"Template Name"}
              </div>
              <Input
                className={`${templateInputClassName} ${
                  !templateInfo.name ||
                  templateInfo.name.trim() === "" ||
                  templateInfo.name.length < 2 ||
                  templateInfo.name.length > 255
                    ? "error-input"
                    : ""
                }`}
                onChange={(e: any) => changeItem("name", e)}
                value={templateInfo.name}
              ></Input>
              {(!templateInfo.name ||
                templateInfo.name.trim() === "" ||
                templateInfo.name.length < 2 ||
                templateInfo.name.length > 255) && (
                <div className={"ant-form-item-explain-error"}>
                  {"Please input the template name, length 2-255"}
                </div>
              )}
            </div>
            <div>
              <div
                className={cn(
                  "flex flex-row items-center gap-[6px]",
                  labelClassName,
                )}
              >
                <span>Min CUDA Version</span>
                <Tooltip
                  overlayInnerStyle={{
                    maxWidth: "340px",
                    padding: "12px",
                  }}
                  placement="top"
                  zIndex={2000}
                  title={
                    <div>
                      Specify the min required CUDA runtime version to ensure
                      compatibility with the GPU environment.
                    </div>
                  }
                >
                  <span className="iconfont icon-badge-help text-[var(--dark-2)]"></span>
                </Tooltip>
              </div>
              <SelectFilter
                {...{
                  value: templateInfo.minCudaVersion,
                  options: cudaVersions,
                  onValueChange: (e) =>
                    changeItem("minCudaVersion", {
                      target: { value: e },
                    }),
                  onClear: () => changeItem("minCudaVersion"),
                  allowClear: !!templateInfo.minCudaVersion,
                  // i18n-disable-next-line
                  clearAriaLabel: "Clear min CUDA version",
                  getOptionValue: (item: any) => item,
                  getOptionLabel: (item: any) => item,
                  renderOption: (item: any) => item,
                  // i18n-disable-next-line
                  triggerClassName: "w-[180px] text-[var(--dark-1)]",
                  showSearch: false,
                }}
              />
            </div>
          </div>

          <div className={`flex gap-[8px] ${imageRowMarginClassName}`}>
            <div className="w-full">
              <div className={labelClassName}>
                <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                  *
                </span>
                {"Container Image"}
              </div>
              <Input
                className={`${templateInputClassName} ${
                  imageInit && imageError ? "error-input" : ""
                }`}
                placeholder={"Please input your Image address"}
                onChange={(e: any) => {
                  changeItem("image", e);
                  setImageInit(true);
                }}
                value={templateInfo.image}
              ></Input>
              {imageInit && imageError && (
                <div className={"ant-form-item-explain-error"}>
                  {imageError}
                </div>
              )}
            </div>
            {isPrewarm && registryCredentialsField}
          </div>
          {!isPrewarm && (
            <div className="mb-[24px]">{registryCredentialsField}</div>
          )}

          <div className={fieldClassName}>
            <div className={labelClassName}>{"Container Start Command"}</div>
            <Input
              className={multilineInputClassName}
              placeholder={"This overrides the CMD in the Docker container"}
              onChange={(e: any) => changeItem("startCommand", e)}
              value={templateInfo.startCommand}
            ></Input>
          </div>

          <div className={fieldClassName}>
            <div className={labelClassName}>{"Entrypoint"}</div>
            <Input
              className={`${multilineInputClassName} ${
                entrypointInit && entrypointError ? "error-input" : ""
              }`}
              placeholder={"Please input the entrypoint"}
              onChange={(e: any) => {
                setEntrypointInit(true);
                changeItem("entrypoint", e);
              }}
              value={templateInfo.entrypoint}
            ></Input>
            {entrypointInit && entrypointError && (
              <div className={"ant-form-item-explain-error"}>
                {entrypointError}
              </div>
            )}
          </div>

          <div className={localRowClassName}>
            <div className={formStyles.half}>
              <div className="mr-[18px] inline-block w-[calc(50%_-_9px)]">
                <div className={labelClassName}>
                  <span className="mr-1 text-[var(--red-1)]">*</span>
                  {dealParamsText("Container Disk(${0}GB Free)", {
                    0: freeInfo.freeRootFS,
                  })}
                </div>
                <div className="relative">
                  <Input
                    onChange={(e: any) => changeItem("rootfsSize", e)}
                    value={templateInfo.rootfsSize}
                    className={`${templateInputClassName} ${
                      rootfsSizeInit && rootfsSizeError ? "error-input" : ""
                    }`}
                  ></Input>
                  <span className={formStyles.unit}>GB</span>
                </div>
                {rootfsSizeInit && rootfsSizeError && (
                  <div className={"ant-form-item-explain-error"}>
                    {rootfsSizeError}
                  </div>
                )}
              </div>
              {showLocal && (
                <div className="inline-block w-[calc(50%_-_9px)] text-end">
                  <label className="inline-flex items-center gap-2">
                    <Checkbox
                      checked={mountLocal}
                      onCheckedChange={(checked) => {
                        setMountLocal(checked === true);
                      }}
                    />
                    <span className="text-sm font-normal leading-5">
                      {"Local Mount"}
                    </span>
                  </label>
                </div>
              )}
            </div>
            {showLocal && mountLocal && (
              <div className={formStyles.otherHalf}>
                <div className="mr-4 inline-block w-[calc(50%_-_8px)]">
                  <div className={labelClassName}>
                    <span className="mr-1 text-[var(--red-1)]">*</span>
                    {dealParamsText("Volume Disk(${0}GB Free)", {
                      0: freeInfo.freeLocalStorage,
                    })}
                  </div>
                  <div className="relative">
                    <Input
                      className={secondaryTemplateInputClassName}
                      onChange={(e: any) => changeItem("localVolumeSize", e)}
                      value={templateInfo.localVolumeSize}
                    ></Input>
                    <span className={formStyles.unit}>GB</span>
                  </div>
                </div>
                <div className="inline-block w-[calc(50%_-_8px)]">
                  <div className={labelClassName}>{"Volume Mount Path"}</div>
                  <Input
                    className={secondaryTemplateInputClassName}
                    onChange={(e: any) => changeItem("localVolumeMount", e)}
                    value={templateInfo.localVolumeMount}
                  ></Input>
                </div>
              </div>
            )}
          </div>
          {showLocal && (
            <div className={fieldClassName}>
              <div className="flex justify-between gap-1 px-3 py-2 rounded-[var(--radius-input)] bg-common-gray-3">
                <div className="w-4 shrink-0 mt-[-2px]">
                  <span className="iconfont icon-badge-alert text-common-dark-2 text-[16px]"></span>
                </div>
                <div className="flex flex-col gap-2 grow">
                  <div className="text-common-dark-2 font-small-console">
                    <div>
                      Volume Disk is no longer supported (Container Disk has
                      been expanded). Please{" "}
                      <span className="text-[var(--brand-1)]">
                        uncheck &quot;Local Mount&quot;
                      </span>{" "}
                      and store data on the Container Disk.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className={portsRowClassName}>
            <div className={formStyles.half}>
              <div className={labelClassName}>
                {"Expose HTTP Ports (Max 10)"}
              </div>
              <Input
                onChange={(e: any) => changeItem("httpports", e)}
                value={templateInfo.httpports}
                className={`${templateInputClassName} ${
                  httpError ? "error-input" : ""
                }`}
              ></Input>
              {httpError && (
                <div className={"ant-form-item-explain-error"}>{httpError}</div>
              )}
            </div>
            <div className={formStyles.otherHalf}>
              <div className={labelClassName}>{"Expose TCP Ports"}</div>
              <Input
                onChange={(e: any) => changeItem("tcpports", e)}
                value={templateInfo.tcpports}
                className={`${templateInputClassName} ${
                  tcpError ? "error-input" : ""
                }`}
              ></Input>
              {tcpError && (
                <div className={"ant-form-item-explain-error"}>{tcpError}</div>
              )}
            </div>
          </div>
          <div className={environmentClassName}>
            <Collapsible className="createInstanceAdvance">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="group relative mb-3 flex w-full items-center text-left"
                >
                  <span className="relative p-0 text-[var(--black)]">
                    {"Environment Variables"}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 text-[var(--black)] transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div>
                  {templateInfo.envs
                    ? templateInfo.envs.map((item: any, index: number) => {
                        return (
                          <div className="mb-5" key={index}>
                            <div className={formStyles.half}>
                              <Input
                                onChange={(e: any) =>
                                  inputEnvInfo(index, "key", e)
                                }
                                placeholder={"key"}
                                className={templateInputClassName}
                                value={item.key}
                              ></Input>
                            </div>
                            <div
                              className={`${formStyles.otherHalf} ${formStyles.envValueGroup}`}
                            >
                              <Input
                                onChange={(e: any) =>
                                  inputEnvInfo(index, "value", e)
                                }
                                placeholder={"value"}
                                className={templateInputClassName}
                                value={item.value}
                              ></Input>
                              <Button
                                onClick={() => removeEnv(index)}
                                className={cn("h-9 w-9 min-w-9 rounded-[6px]")}
                                variant="noborderoutline"
                              >
                                {/* <img src="/gpu-instance/instances/icon-delete.svg" /> */}
                                <span className="iconfont icon-delete text-lg text-[var(--black)]" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    : ""}

                  <Button
                    onClick={() => addEnvs()}
                    className={formStyles.addEnvVar}
                    variant="outline"
                  >
                    <span className={formStyles.addEnvVarTxt}>
                      {"+ Add Environment Variable"}
                    </span>
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      ) : (
        <div>
          <div className={fieldClassName}>
            <div className={labelClassName}>README-Markdown</div>
            <Textarea
              rows={10}
              onChange={(e: any) => changeItem("readme", e)}
              value={templateInfo.readme}
              className={cn(
                formStyles.readme,
                "h-[225px] rounded-[var(--radius-input)] border border-[var(--gray-2)] bg-[var(--white)] px-5 py-[13px] text-sm text-[var(--black)]",
              )}
            />
          </div>
          <div className="mb-9 h-56">
            <div className={labelClassName}>{"Preview"}</div>

            <div
              className={cn(
                "h-[200px] overflow-y-auto rounded-[var(--radius-input)]",
                isPrewarm ? "overflow-x-hidden" : "overflow-x-auto",
                !isPrewarm && formStyles.previewWrapper,
              )}
            >
              <MyMdEditor
                {...{
                  noIconfont: true,
                  noUploadImg: true,
                  toolbars: [],
                  footers: [],
                  inputBoxWitdh: "0",
                  style: {
                    float: "left",
                    height: "auto",
                    minHeight: "200px",
                    minWidth: isPrewarm ? undefined : "100%",
                    borderRadius: "var(--radius-input)",
                  },
                  modelValue: templateInfo.readme,
                  htmlPreview: true,
                }}
              ></MyMdEditor>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
