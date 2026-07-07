import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { getPodStateName } from "@/lib/utils/gpuInstance";
import { PodStatus } from "@/lib/utils/gpuInstance";
import { CircleHelp as QuestionCircleOutlined } from "lucide-react";
import { sliceDateString, sliceUTCString } from "@/lib/utils/date";
import styles from "./podState.module.scss";

function stateColor(state: any) {
  switch (state) {
    case PodStatus.Running:
    case PodStatus.running:
      return "var(--black)";
    case PodStatus.ToBeCreated:
    case PodStatus.CreatePending:
    case PodStatus.Created:
    case PodStatus.ToBeStarted:
    case PodStatus.pulling:
    case PodStatus.toStart:
    case PodStatus.starting:
    case PodStatus.migrating:
    case PodStatus.toCreate:
    case PodStatus.Starting:
    case PodStatus.creating:
    case PodStatus.resetting:
    case PodStatus.toRestart:
    case PodStatus.restarting:
      return "var(--black)";
    case PodStatus.Exited:
    case PodStatus.Terminated:
    case PodStatus.exited:
    case PodStatus.removed:
    case PodStatus.ToBeExited:
    case PodStatus.ToBeTerminated:
    case PodStatus.Terminating:
    case PodStatus.toRemove:
    case PodStatus.removing:
    case PodStatus.Stopping:
    case PodStatus.toStop:
    case PodStatus.stopping:
      return "var(--black)";
    default:
      return "red";
  }
}
function showCircle(state: any) {
  switch (state) {
    case PodStatus.CreatePending:
    case PodStatus.pulling:
    case PodStatus.starting:
    case PodStatus.migrating:
    case PodStatus.Starting:
    case PodStatus.creating:
    case PodStatus.resetting:
    case PodStatus.restarting:
    case PodStatus.removing:
    case PodStatus.Stopping:
    case PodStatus.stopping:
      return true;
    default:
      return false;
  }
}
function stateBgColor(state: any) {
  switch (state) {
    case PodStatus.Running:
    case PodStatus.running:
      return "var(--brand-2)";
    case PodStatus.ToBeCreated:
    case PodStatus.CreatePending:
    case PodStatus.Created:
    case PodStatus.ToBeStarted:
    case PodStatus.pulling:
    case PodStatus.toStart:
    case PodStatus.starting:
    case PodStatus.migrating:
    case PodStatus.toCreate:
    case PodStatus.Starting:
    case PodStatus.creating:
    case PodStatus.resetting:
    case PodStatus.toRestart:
    case PodStatus.restarting:
      return "var(--purple-6)";
    case PodStatus.Exited:
    case PodStatus.Terminated:
    case PodStatus.exited:
    case PodStatus.removed:
    case PodStatus.ToBeExited:
    case PodStatus.ToBeTerminated:
    case PodStatus.Terminating:
    case PodStatus.toRemove:
    case PodStatus.removing:
    case PodStatus.Stopping:
    case PodStatus.toStop:
    case PodStatus.stopping:
    default:
      return "var(--gray-3)";
  }
}
export default function PodState(props: any) {
  const initColor = props?.errorText ? "rgb(104,103,130)" : "";
  return (
    <span className="flex items-center gap-4">
      {props.errorText ? (
        <Tooltip
          title={
            <div>
              <div>{props.errorText}</div>
              <div>{props.errorMessage}</div>
            </div>
          }
        >
          <span style={{ color: initColor }}>
            <QuestionCircleOutlined size={14} style={{ color: "#F00" }} />
          </span>
        </Tooltip>
      ) : (
        ""
      )}

      {props?.instanceInfo?.lastStartedAt &&
      props.instanceInfo.lastStartedAt !== "0" ? (
        <Tooltip
          title={
            <div>
              {"Last start time:"}{" "}
              {true
                ? sliceUTCString(
                    new Date(
                      Number(props.instanceInfo.lastStartedAt) * 1000,
                    ).toUTCString(),
                    "second",
                  )
                : sliceDateString(
                    new Date(Number(props.instanceInfo.lastStartedAt) * 1000),
                    "second",
                  )}
            </div>
          }
        >
          <div
            className={styles.stateContainer}
            style={{
              background: stateBgColor(props.state),
              border: "none",
            }}
          >
            <span className={styles.stateTextContainer}>
              <span
                className={styles.stateText}
                style={{
                  color: stateColor(props.state),
                }}
              >
                {showCircle(props.state) && (
                  <div className="w-[12px] h-[12px]">
                    <img
                      src="/gpu-instance/instances/icon-ing.svg"
                      alt=""
                      width={12}
                      height={12}
                      className="w-[12px] h-[12px]"
                    />
                  </div>
                )}
                <span>{getPodStateName(props.state)}</span>
              </span>
            </span>
          </div>
        </Tooltip>
      ) : (
        <div
          className={styles.stateContainer}
          style={{
            background: stateBgColor(props.state),
            border: "none",
          }}
        >
          <span className={styles.stateTextContainer}>
            <span
              className={styles.stateText}
              style={{
                color: stateColor(props.state),
              }}
            >
              {showCircle(props.state) && (
                <div className="w-[12px] h-[12px]">
                  <img
                    src="/gpu-instance/instances/icon-ing.svg"
                    alt=""
                    width={12}
                    height={12}
                    className="w-[12px] h-[12px]"
                  />
                </div>
              )}
              <span>{getPodStateName(props.state)}</span>
            </span>
          </span>
        </div>
      )}
    </span>
  );
}
