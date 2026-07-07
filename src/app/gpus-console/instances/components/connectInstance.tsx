"use client";
import styles from "./connectInstance.module.scss";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import {
  reqSingleGpuInstance,
  reqStartInstanceTerminal,
  reqStopInstanceTerminal,
} from "@/api/gpu-instance/instances";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { copyText, dealParamsText } from "@/lib/utils/utils";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export default function ConnectInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const { locale } = useI18n();
  const [instanceInfo, setInstanceInfo] = useState({
    ...instanceInfoObj,
    httpPorts:
      instanceInfoObj?.portMappings?.filter(
        (item: any) => item.type === "http",
      ) || [],
    tcpPorts:
      instanceInfoObj?.portMappings?.filter(
        (item: any) => item.type === "tcp",
      ) || [],
  });
  const [repeatNum, setRepeatNum] = useState(3);
  const [operateState, setOperateState] = useState("done");
  const repeatNumRef = useRef(repeatNum);
  const operateStateRef = useRef(operateState);
  const pollCounterRef = useRef(30);
  const getSingleGpuInstance = useCallback((id: string) => {
    reqSingleGpuInstance(id)
      .then((res: any) => {
        const instanceInfoObj: any = res || {};
        setInstanceInfo({
          ...instanceInfoObj,
          httpPorts:
            instanceInfoObj?.portMappings?.filter(
              (item: any) => item.type === "http",
            ) || [],
          tcpPorts:
            instanceInfoObj?.portMappings?.filter(
              (item: any) => item.type === "tcp",
            ) || [],
        });
        if (
          instanceInfoObj?.connectComponentWebTerminal?.isRunning &&
          repeatNumRef.current === 2 &&
          operateStateRef.current === "starting"
        ) {
          repeatNumRef.current = 3;
          operateStateRef.current = "done";
          setRepeatNum(3);
          setOperateState("done");
        }
        if (
          !instanceInfoObj?.connectComponentWebTerminal?.isRunning &&
          repeatNumRef.current === 2 &&
          operateStateRef.current === "stopping"
        ) {
          repeatNumRef.current = 3;
          operateStateRef.current = "done";
          setRepeatNum(3);
          setOperateState("done");
        }
      })
      .catch(() => {
        setInstanceInfo({});
      });
  }, []);
  useEffect(() => {
    if (instanceInfo.id) {
      getSingleGpuInstance(instanceInfo.id);
    }
  }, [getSingleGpuInstance, instanceInfo.id]);

  const [alignment, setAlignment] = useState("left");
  const children = [
    <ToggleGroupItem
      className={
        alignment === "left"
          ? styles.currentToggleBtn
          : styles.unCurrentToggleBtn
      }
      value="left"
      key="left"
    >
      <span
        className={
          alignment === "left" ? styles.selectedTabTxt : styles.unSelectedTabTxt
        }
      >
        {"Connection Options"}
      </span>
    </ToggleGroupItem>,
    <ToggleGroupItem
      className={
        alignment === "middle"
          ? styles.currentToggleBtn
          : styles.unCurrentToggleBtn
      }
      value="middle"
      key="middle"
    >
      <span
        className={
          alignment === "middle"
            ? styles.selectedTabTxt
            : styles.unSelectedTabTxt
        }
      >
        {"TCP Port Mappings"}
      </span>
    </ToggleGroupItem>,
    <ToggleGroupItem
      className={
        alignment === "right"
          ? styles.currentLastToggleBtn
          : styles.unCurrentLastToggleBtn
      }
      value="right"
      key="right"
    >
      <span
        className={
          alignment === "right"
            ? styles.selectedTabTxt
            : styles.unSelectedTabTxt
        }
      >
        {"Configure Public Key"}
      </span>
    </ToggleGroupItem>,
  ];
  useEffect(() => {
    const timerHandler = setInterval(() => {
      if (pollCounterRef.current <= 0) {
        pollCounterRef.current = 30;
      }
      if (pollCounterRef.current % repeatNumRef.current === 0) {
        if (instanceInfo.id) {
          getSingleGpuInstance(instanceInfo.id);
        }
      }
      pollCounterRef.current -= 1;
    }, 3000);

    return () => {
      clearInterval(timerHandler);
    };
  }, [getSingleGpuInstance, instanceInfo.id]);
  function startWebTerminal(instanceId: string) {
    if (instanceId) {
      reqStartInstanceTerminal(instanceId).then((res: any) => {
        message.success("success");
        repeatNumRef.current = 2;
        operateStateRef.current = "starting";
        pollCounterRef.current = 30;
        setRepeatNum(2);
        setOperateState("starting");
        getSingleGpuInstance(instanceId);
        // todo yexiu: Polling for details
      });
    }
  }
  function stopWebTerminal(instanceId: string) {
    if (instanceId) {
      reqStopInstanceTerminal(instanceId).then((res: any) => {
        message.success("success");
        repeatNumRef.current = 2;
        operateStateRef.current = "stopping";
        pollCounterRef.current = 30;
        setRepeatNum(2);
        setOperateState("stopping");
        getSingleGpuInstance(instanceId);
        // todo yexiu: Polling for details
      });
    }
  }
  function openPage(url: string) {
    if ("undefined" != typeof window) {
      window.open(url);
    }
  }
  function toSettingPage() {
    window.location.href = getLocalizedPath(
      NOVITA_URL.GPU_CONSOLE_SETTINGS,
      locale,
    );
  }
  function encryptPwd(pwd: string) {
    if (!pwd || pwd.trim() === "") {
      return pwd;
    } else if (pwd.length <= 4) {
      return "********";
    } else {
      const firstTwo = pwd.slice(0, 2);
      const lastTwo = pwd.slice(-2);
      const middleStars = "*".repeat(pwd.length - 4);
      return `${firstTwo}${middleStars}${lastTwo}`;
    }
  }
  return (
    <div className={styles.subContainer}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Connect"}</h1>
        <div>
          <div className={styles.toggleBtnGroup}>
            <ToggleGroup
              type="single"
              value={alignment}
              onValueChange={(value) => value && setAlignment(value)}
              className={styles.toggleGroup}
              aria-label="Large sizes"
            >
              {children}
            </ToggleGroup>
          </div>
          {alignment === "left" ? (
            <div className={styles.tabContent}>
              <div className={styles.httpPorts}>
                {instanceInfo?.httpPorts?.map((item: any, index: number) => (
                  <Button
                    key={index}
                    id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_CONNECT_TO_HTTP}
                    onClick={() => openPage(item?.endpoint || "")}
                    className={styles.httpPortBtn}
                  >
                    <span className={styles.httpPortTxt}>
                      {dealParamsText("Connect to HTTP Service [Port ${0}]", {
                        0: item?.port || "-",
                      })}
                    </span>
                    <span
                      className={`ml-2 text-[var(--dark-1)] iconfont icon-copy transition hover:scale-110 delay-75 duration-200 ${styles.copy_btn} ${styles.copyIcon}`}
                      id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_CONNECT_COPY_HTTP}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        copyText(item?.endpoint || "");
                      }}
                    ></span>
                  </Button>
                ))}
                {instanceInfo?.connectComponentJupyter?.address ? (
                  <Button
                    id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_CONNECT_TO_JUPYTER}
                    onClick={() =>
                      openPage(
                        instanceInfo?.connectComponentJupyter?.address || "",
                      )
                    }
                    className={styles.httpPortBtn}
                  >
                    <span className={styles.httpPortTxt}>
                      {dealParamsText("Connect to ${0} [Port ${1}]", {
                        0: "Jupyter Lab",
                        1: instanceInfo?.connectComponentJupyter?.port || "-",
                      })}
                    </span>
                    <span
                      className={`ml-2 text-[var(--dark-1)] iconfont icon-copy transition hover:scale-110 delay-75 duration-200 ${styles.copy_btn} ${styles.copyIcon}`}
                      id={
                        CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_CONNECT_COPY_JUPYTER
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        copyText(
                          instanceInfo?.connectComponentJupyter?.address || "",
                        );
                      }}
                    ></span>
                  </Button>
                ) : (
                  ""
                )}
              </div>
              <div className={styles.fullWidth}>
                <div className={styles.webTerminalBtnContainer}>
                  {instanceInfo?.connectComponentWebTerminal?.isRunning ? (
                    repeatNum === 2 ? (
                      <Button
                        disabled
                        className={`${styles.connectWebTerDisBtn} ${styles.disabledBtn}`}
                      >
                        <img
                          className={styles.connectWebOperatingBtn}
                          alt="loading"
                          src="/gpu-instance/loading.gif"
                        />
                        <span className={styles.connectWebTerBtnTxt}>
                          Stopping
                        </span>
                      </Button>
                    ) : (
                      <Button
                        id={
                          CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_STOP_WEB_TERMINAL
                        }
                        onClick={() => stopWebTerminal(instanceInfo?.id)}
                        className={styles.stopWebTerminalBtn}
                      >
                        <span className={styles.stopWebTerminalBtnTxt}>
                          {"Stop Web Terminal"}
                        </span>
                      </Button>
                    )
                  ) : repeatNum === 2 ? (
                    <Button
                      disabled
                      className={`${styles.connectWebTerDisBtn} ${styles.disabledBtn}`}
                    >
                      <img
                        className={styles.connectWebOperatingBtn}
                        alt="loading"
                        src="/gpu-instance/loading.gif"
                      />
                      <span className={styles.connectWebTerBtnTxt}>
                        Starting
                      </span>
                    </Button>
                  ) : (
                    <Button
                      id={
                        CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_START_WEB_TERMINAL
                      }
                      onClick={() => startWebTerminal(instanceInfo?.id)}
                      className={styles.startWebTerminalBtn}
                    >
                      <span className={styles.startWebTerminalBtnTxt}>
                        {"Start Web Terminal"}
                      </span>
                    </Button>
                  )}
                </div>
                <div className={styles.halfWidth}>
                  {instanceInfo?.connectComponentWebTerminal?.isRunning ? (
                    <Button
                      id={
                        CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_CONNECT_WEB_TERMINAL
                      }
                      onClick={() =>
                        openPage(
                          instanceInfo?.connectComponentWebTerminal?.address,
                        )
                      }
                      className={styles.connectWebTerBtn}
                    >
                      <span className={styles.startWebTerminalBtnTxt}>
                        {"Connect to Web Terminal"}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className={`${styles.connectWebTerDisBtn} ${styles.disabledBtn}`}
                    >
                      <span className={styles.connectWebTerBtnTxt}>
                        {"Connect to Web Terminal"}
                      </span>
                    </Button>
                  )}
                </div>

                {instanceInfo?.connectComponentWebTerminal?.username ? (
                  <div className={styles.usernameTxt}>
                    {"username"}:{" "}
                    {instanceInfo.connectComponentWebTerminal.username}
                  </div>
                ) : (
                  ""
                )}
                {instanceInfo?.connectComponentWebTerminal?.password ? (
                  <div className={styles.passwordTxt}>
                    {"password"}:{" "}
                    {encryptPwd(
                      instanceInfo.connectComponentWebTerminal.password || "",
                    )}
                    <span
                      className={`ml-2 text-[var(--dark-1)] iconfont icon-copy transition hover:scale-110 delay-75 duration-200 ${styles.copy_btn} ${styles.copyIcon}`}
                      id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_COPY_PASSWORD}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        copyText(
                          instanceInfo.connectComponentWebTerminal.password ||
                            "",
                        );
                      }}
                    ></span>
                  </div>
                ) : (
                  ""
                )}

                <div className={styles.sshTips}>{"Basic SSH Terminal:"}</div>
                <Tooltip title={<div>{"Click to copy"}</div>}>
                  <div
                    id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_COPY_SSH_TERMINAL}
                    onClick={() => {
                      copyText(
                        instanceInfo?.connectComponentSSH?.sshCommand || "",
                      );
                    }}
                    className={styles.sshCommandTxt}
                  >
                    {instanceInfo?.connectComponentSSH?.sshCommand || ""}
                  </div>
                </Tooltip>
              </div>
            </div>
          ) : (
            ""
          )}

          {alignment === "middle" ? (
            <div className={styles.tabContent}>
              <div className={styles.tcpMapContainer}>
                <div className={styles.tcpMapTip}>
                  {
                    "These are the TCP Port mappings that you can use to connect to your pod If you're not sure what to do with these, you can"
                  }{" "}
                  <a
                    id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_TCP_TO_DOCS}
                    className={styles.textLink}
                    href={DOCS_URL.CREATEINSTANCES}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {"Click Here to Learn More"}
                  </a>
                </div>
                <div className={styles.tcpList}>
                  {instanceInfo?.tcpPorts?.map((item: any, index: number) => (
                    <div key={index} className={styles.tcpMapItem}>
                      Internal: {item?.port} External: {item?.endpoint}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            ""
          )}

          {alignment === "right" ? (
            <div className={styles.tabContent}>
              <div className={styles.configPubKeyDesc}>
                {
                  "Run the follow command to generate your public/private key pair."
                }
              </div>
              <Tooltip title={<div>{"Click to copy"}</div>}>
                <div
                  id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_COPY_KEY_PAIR}
                  onClick={() => {
                    copyText(
                      'ssh-keygen -t ed25519 -C "your_email@example.com"',
                    );
                  }}
                  className={styles.configPubKey}
                >
                  ssh-keygen -t ed25519 -C &quot;your_email@example.com&quot;
                </div>
              </Tooltip>
              <div className={styles.configPubHelpTip1}>
                {"You can add your SSH public key in the"}{" "}
                <a
                  className={styles.textLink}
                  href={getLocalizedPath(
                    NOVITA_URL.GPU_CONSOLE_SETTINGS,
                    locale,
                  )}
                  id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_CONFIGURE_TO_SETTINGS}
                >
                  {"Settings"}
                </a>{" "}
                {"menu"}.
              </div>
              <div className={styles.configPubLearnMoreTip1}>
                {"Learn more about"}{" "}
                <a
                  className={styles.textLink}
                  href={DOCS_URL.CONNECTTOINSTANCE}
                  target="_blank"
                  rel="noreferrer"
                  id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_CONFIGURE_TO_DOCS}
                >
                  {"generating SSH keys"}
                </a>
                {""}
              </div>
            </div>
          ) : (
            ""
          )}

          <div className={styles.closeAction}>
            <Button
              onClick={() => finishForm()}
              className={styles.closeBtn}
              variant="default"
            >
              <span className={styles.closeBtnTxt}>{"Close"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
