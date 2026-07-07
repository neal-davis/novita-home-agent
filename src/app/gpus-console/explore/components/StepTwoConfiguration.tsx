import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./stepTwo.module.scss";

export default function StepTwoConfiguration({
  state,
  actions,
  validators,
}: any) {
  const { createInstanceInfo, invalidConfigMarks, inputEnvInfo } = state;
  const { changeCreateInstanceInfo, removeEnv, AddEnvs } = actions;
  const {
    getConfigInvalidTips,
    judgeImage,
    judgeEntrypoint,
    judgeHttpPorts,
    judgeTcpPorts,
    judgeKey,
  } = validators;

  return (
    <div>
      <div className="font-subtle-medium text-[var(--dark-1)] mb-[16px]">
        Configuration
      </div>
      <div className={styles.otherHalf}>
        <div
          className="flex flex-col gap-[16px]"
          style={{ padding: "var(--spacing-console-16)" }}
        >
          <div className="flex flex-row gap-[12px]">
            <div className="flex flex-col flex-1">
              <div className={styles.containerImageTxt}>
                <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                  *
                </span>
                {"Container Image"}
              </div>
              <Input
                onBlur={judgeImage}
                className={`${styles.inputItem}
                  ${invalidConfigMarks?.image ? styles.redInput : ""}`}
                onChange={(e: any) =>
                  changeCreateInstanceInfo("imageUrl", e.target.value)
                }
                value={createInstanceInfo?.imageUrl}
              ></Input>
            </div>
            <div className="flex flex-col flex-1">
              <div className={styles.containerImageTxt}>
                {"Container Start Command"}
              </div>
              <Input
                className={`${styles.inputItem}`}
                onChange={(e: any) =>
                  changeCreateInstanceInfo("command", e.target.value)
                }
                value={createInstanceInfo.command}
              />
            </div>
            <div className="flex flex-col flex-1">
              <div className={styles.containerImageTxt}>{"Entrypoint"}</div>
              <Input
                onBlur={judgeEntrypoint}
                className={`${styles.inputItem}
                  ${invalidConfigMarks?.entrypoint ? styles.redInput : ""}`}
                onChange={(e: any) =>
                  changeCreateInstanceInfo("entrypoint", e.target.value)
                }
                value={createInstanceInfo.entrypoint}
              />
            </div>
          </div>
          <div className="flex flex-row gap-[12px]">
            <div className="flex flex-col flex-1">
              <div className={styles.httpPortsTxt}>
                {"Expose HTTP Ports (Max 10)"}
              </div>
              <Input
                onBlur={judgeHttpPorts}
                className={`${styles.inputItem}
                ${invalidConfigMarks?.httpPorts ? styles.redInput : ""}`}
                onChange={(e: any) =>
                  changeCreateInstanceInfo("httpPorts", e.target.value)
                }
                value={createInstanceInfo?.httpPorts || ","}
              ></Input>
            </div>
            <div className="flex flex-col flex-1">
              <div className={styles.freeLocalStorage}>
                {"Expose TCP Ports"}
              </div>
              <Input
                onBlur={judgeTcpPorts}
                className={`${styles.inputItem}
                ${invalidConfigMarks?.tcpPorts ? styles.redInput : ""}`}
                onChange={(e: any) =>
                  changeCreateInstanceInfo("tcpPorts", e.target.value)
                }
                value={createInstanceInfo?.tcpPorts || ","}
              ></Input>
            </div>
          </div>
          <div className="w-[calc(50%-6px)] rounded-[6px] border !border-[var(--gray-1)]">
            <Collapsible defaultOpen className="createInstanceAdvance">
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="noborderghost"
                  className="group flex w-full items-center justify-between px-3 py-2 text-left hover:bg-white"
                >
                  <span className={styles.envVarTxt}>
                    {"Environment Variables"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[var(--black)] transition-transform group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-[12px]">
                  {createInstanceInfo.envs
                    ? createInstanceInfo.envs.map(
                        (item: any, index: number) => {
                          return (
                            <div className={styles.envRow} key={index}>
                              <div className={styles.halfEnv}>
                                <Input
                                  onBlur={judgeKey}
                                  onChange={(e: any) =>
                                    inputEnvInfo(index, "key", e)
                                  }
                                  placeholder={"key"}
                                  className={`${styles.inputItem}
                                    ${
                                      invalidConfigMarks?.key &&
                                      item.key.trim() === ""
                                        ? styles.redInput
                                        : ""
                                    }`}
                                  value={item.key}
                                ></Input>
                              </div>
                              <div className={styles.otherHalfEnv}>
                                <Input
                                  // onBlur={judgeValue}
                                  onChange={(e: any) =>
                                    inputEnvInfo(index, "value", e)
                                  }
                                  placeholder={"value"}
                                  className={`${styles.valueInputItem}
                                    ${
                                      invalidConfigMarks?.value &&
                                      item.value.trim() === ""
                                        ? styles.redInput
                                        : ""
                                    }`}
                                  // i18n-disable-next-line
                                  containerClassName="flex-1 min-w-0"
                                  value={item.value}
                                ></Input>
                                <Button
                                  onClick={() => removeEnv(index)}
                                  className={cn(styles.envDelete)}
                                  size="icon"
                                  variant="noborderoutline"
                                >
                                  <span
                                    className={`iconfont icon-delete`}
                                    style={{
                                      color: "var(--black)",
                                      fontSize: "18px",
                                    }}
                                  />
                                </Button>
                              </div>
                            </div>
                          );
                        },
                      )
                    : ""}
                  <Button
                    variant="outline"
                    className="h-[32px]"
                    onClick={() => AddEnvs()}
                  >
                    {"+ Add Environment Variable"}
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        {getConfigInvalidTips() ? (
          <div className={styles.errorTip}>{getConfigInvalidTips()}</div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
