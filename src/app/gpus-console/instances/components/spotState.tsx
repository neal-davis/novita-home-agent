import { getSpotStateName } from "@/lib/utils/gpuInstance";
import { PodStatus } from "@/lib/utils/gpuInstance";
import styles from "./spotState.module.scss";
import { useEffect, useRef, useState } from "react";

function stateColor(state: any) {
  switch (state) {
    case PodStatus.Running:
    case PodStatus.running:
      return "#0CAF60";
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
      return "#5856D6";
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
      return "#808191";
    case "notified":
    case "reclaiming":
      return "var(--black)";
    default:
      return "red";
  }
}
function stateBgColor(state: any) {
  switch (state) {
    case PodStatus.Running:
    case PodStatus.running:
      return "rgba(12,175,96,0.1)";
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
      return "rgba(88,86,214,0.1)";
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
      return "rgba(17,20,45,0.1)";
    case "notified":
    case "reclaiming":
      return "var(--gray-3)";
    default:
      return "rgba(17,20,45,0.1)";
  }
}
// function stateBorderColor(state: any) {
//   switch (state) {
//     case PodStatus.Running:
//     case PodStatus.running:
//       return "#0CAF60";
//     case PodStatus.ToBeCreated:
//     case PodStatus.CreatePending:
//     case PodStatus.Created:
//     case PodStatus.ToBeStarted:
//     case PodStatus.pulling:
//     case PodStatus.toStart:
//     case PodStatus.starting:
//     case PodStatus.migrating:
//     case PodStatus.toCreate:
//     case PodStatus.Starting:
//     case PodStatus.creating:
//     case PodStatus.resetting:
//     case PodStatus.toRestart:
//     case PodStatus.restarting:
//       return "#5856D6";
//     case PodStatus.Exited:
//     case PodStatus.Terminated:
//     case PodStatus.exited:
//     case PodStatus.removed:
//     case PodStatus.ToBeExited:
//     case PodStatus.ToBeTerminated:
//     case PodStatus.Terminating:
//     case PodStatus.toRemove:
//     case PodStatus.removing:
//     case PodStatus.Stopping:
//     case PodStatus.toStop:
//     case PodStatus.stopping:
//     default:
//       return "#A9ACBE";
//   }
// }
export default function SpotState(props: any) {
  const [nowDate, setNowDate] = useState(new Date());
  const timerHandler = useRef<any>();
  useEffect(() => {
    timerHandler.current = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => {
      clearInterval(timerHandler.current);
    };
  }, []);

  function getIntervalTime() {
    const reclaimTime = new Date(props.reclaimTime * 1000);
    const diff = reclaimTime.getTime() - nowDate.getTime();
    if (diff <= 0) {
      return "00:00";
    }
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  // const initColor = props?.errorText ? "rgb(104,103,130)" : "";
  return (
    <>
      {/* {props.errorText ? (
        <Tooltip
          title={
            <div>
              <div>{props.errorText}</div>
              <div>{props.errorMessage}</div>
            </div>
          }
        >
          <span style={{ marginRight: "5px", color: initColor }}>
            <QuestionCircleOutlined style={{ color: "#F00" }} />
          </span>
        </Tooltip>
      ) : (
        ""
      )} */}

      {
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
              <span className="text-[var(--black)]">
                {getSpotStateName(props.state)}
              </span>
              <span className="text-[var(--red-1)] ml-[4px]">
                {getIntervalTime()}
              </span>
            </span>
          </span>
        </div>
      }
    </>
  );
}
