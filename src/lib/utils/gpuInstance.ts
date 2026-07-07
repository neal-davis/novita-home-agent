export enum PodStatus {
  ToBeCreated = "toBeCreated",
  CreatePending = "pending",
  Created = "created",
  ToBeStarted = "toBeStarted",
  Starting = "Starting",
  Running = "Running",
  ToBeExited = "toBeExited",
  Stopping = "Stopping",
  Exited = "Exited",
  ToBeTerminated = "toBeTerminated",
  Terminating = "terminating",
  Terminated = "terminated",
  Unknown = "unknown",
  toCreate = "toCreate",
  creating = "creating",
  pulling = "pulling",
  running = "running",
  toStart = "toStart",
  starting = "starting",
  migrating = "migrating",
  toStop = "toStop",
  stopping = "stopping",
  exited = "exited",
  toRemove = "toRemove",
  removing = "removing",
  removed = "removed",
  resetting = "resetting",
  toRestart = "toRestart",
  restarting = "restarting",
}
export function getPodStateName(state: PodStatus): string {
  switch (state) {
    case PodStatus.ToBeCreated:
    case PodStatus.CreatePending:
      return "Creating".toUpperCase();
    case PodStatus.Created:
      return "Created".toUpperCase();
    case PodStatus.ToBeStarted:
    case PodStatus.Starting:
      return "Starting".toUpperCase();
    case PodStatus.Running:
      return "Running".toUpperCase();
    case PodStatus.ToBeExited:
    case PodStatus.Stopping:
      return "Stopping".toUpperCase();
    case PodStatus.Exited:
      return "Exited".toUpperCase();
    case PodStatus.ToBeTerminated:
    case PodStatus.Terminating:
      return "Terminating".toUpperCase();
    case PodStatus.Terminated:
      return "Terminated".toUpperCase();
    case PodStatus.creating:
      return "creating".toUpperCase();
    case PodStatus.toCreate:
      return "toCreate".toUpperCase();
    case PodStatus.pulling:
      return "pulling".toUpperCase();
    case PodStatus.running:
      return "running".toUpperCase();
    case PodStatus.toStart:
      return "toStart".toUpperCase();
    case PodStatus.starting:
      return "starting".toUpperCase();
    case PodStatus.migrating:
      return "migrating".toUpperCase();
    case PodStatus.toStop:
      return "toStop".toUpperCase();
    case PodStatus.stopping:
      return "stopping".toUpperCase();
    case PodStatus.exited:
      return "exited".toUpperCase();
    case PodStatus.toRemove:
      return "toRemove".toUpperCase();
    case PodStatus.removing:
      return "removing".toUpperCase();
    case PodStatus.removed:
      return "removed".toUpperCase();
    case PodStatus.resetting:
      return "resetting".toUpperCase();
    case PodStatus.toRestart:
      return "toRestart".toUpperCase();
    case PodStatus.restarting:
      return "restarting".toUpperCase();
  }
  return "other".toUpperCase();
}
export function getSpotStateName(state: any): string {
  switch (state) {
    case "notified":
      return "Notified".toUpperCase();
    case "reclaiming":
      return "Reclaiming".toUpperCase();
  }
  return "other";
}
