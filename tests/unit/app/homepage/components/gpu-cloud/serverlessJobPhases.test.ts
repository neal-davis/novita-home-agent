import {
  SERVERLESS_JOB_PHASES,
  SERVERLESS_PHASE_COUNT,
  nextServerlessPhaseIndex,
} from "@/app/homepage/components/gpu-cloud/serverlessJobPhases";

describe("serverlessJobPhases", () => {
  it("exports three phases aligned with design spec", () => {
    expect(SERVERLESS_PHASE_COUNT).toBe(3);
    expect(SERVERLESS_JOB_PHASES[0]).toMatchObject({
      activeTag: "queued",
      leftCaption: "allocating gpu resources",
      rightStatus: "allocating",
      progressPercent: 12,
      durationLabel: "0.1s",
      costLabel: "$0.0001",
    });
    expect(SERVERLESS_JOB_PHASES[1]).toMatchObject({
      activeTag: "running",
      leftCaption: "processing job",
      rightStatus: "running",
      progressPercent: 50,
      durationLabel: "1.24s",
      costLabel: "$0.0003",
    });
    expect(SERVERLESS_JOB_PHASES[2]).toMatchObject({
      activeTag: "complete",
      leftCaption: "processing job",
      rightStatus: "complete",
      progressPercent: 100,
      durationLabel: "3.00s",
      costLabel: "$0.0008",
    });
  });

  it("nextServerlessPhaseIndex cycles 0→1→2→0", () => {
    expect(nextServerlessPhaseIndex(0)).toBe(1);
    expect(nextServerlessPhaseIndex(1)).toBe(2);
    expect(nextServerlessPhaseIndex(2)).toBe(0);
  });
});
