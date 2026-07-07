import {
  PodStatus,
  getPodStateName,
  getSpotStateName,
} from "@/lib/utils/gpuInstance";

describe("getPodStateName", () => {
  it("maps creating-family states to CREATING", () => {
    expect(getPodStateName(PodStatus.ToBeCreated)).toBe("CREATING");
    expect(getPodStateName(PodStatus.CreatePending)).toBe("CREATING");
  });

  it("maps starting-family states to STARTING", () => {
    expect(getPodStateName(PodStatus.ToBeStarted)).toBe("STARTING");
    expect(getPodStateName(PodStatus.Starting)).toBe("STARTING");
  });

  it("maps stopping-family states to STOPPING", () => {
    expect(getPodStateName(PodStatus.ToBeExited)).toBe("STOPPING");
    expect(getPodStateName(PodStatus.Stopping)).toBe("STOPPING");
  });

  it("maps terminating-family states to TERMINATING", () => {
    expect(getPodStateName(PodStatus.ToBeTerminated)).toBe("TERMINATING");
    expect(getPodStateName(PodStatus.Terminating)).toBe("TERMINATING");
  });

  it("maps direct states to their uppercase label", () => {
    expect(getPodStateName(PodStatus.Running)).toBe("RUNNING");
    expect(getPodStateName(PodStatus.Created)).toBe("CREATED");
    expect(getPodStateName(PodStatus.Exited)).toBe("EXITED");
    expect(getPodStateName(PodStatus.Terminated)).toBe("TERMINATED");
    expect(getPodStateName(PodStatus.migrating)).toBe("MIGRATING");
    expect(getPodStateName(PodStatus.removed)).toBe("REMOVED");
  });

  it("falls back to OTHER for unknown states", () => {
    expect(getPodStateName("nonsense" as PodStatus)).toBe("OTHER");
    expect(getPodStateName(PodStatus.Unknown)).toBe("OTHER");
  });
});

describe("getSpotStateName", () => {
  it("maps known spot states", () => {
    expect(getSpotStateName("notified")).toBe("NOTIFIED");
    expect(getSpotStateName("reclaiming")).toBe("RECLAIMING");
  });

  it("returns 'other' for unknown spot states", () => {
    expect(getSpotStateName("whatever")).toBe("other");
  });
});
