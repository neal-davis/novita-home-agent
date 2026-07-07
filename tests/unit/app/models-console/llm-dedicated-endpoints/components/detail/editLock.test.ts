import {
  isEndpointEditLocked,
  isEndpointLoraEditLocked,
  LOCKED_ENDPOINT_EDIT_STATES,
  LOCKED_ENDPOINT_LORA_EDIT_STATES,
} from "@/app/models-console/llm-dedicated-endpoints/components/detail/editLock";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";

describe("editLock", () => {
  it("locks editing for transitioning/terminal states", () => {
    [
      LLM_DE_STATUS.PENDING,
      LLM_DE_STATUS.DEPLOYING,
      LLM_DE_STATUS.ROLLING,
      LLM_DE_STATUS.SCALING,
      LLM_DE_STATUS.TERMINATING,
      LLM_DE_STATUS.TERMINATED,
      LLM_DE_STATUS.FAILED,
    ].forEach((s) => expect(isEndpointEditLocked(s)).toBe(true));
  });

  it("allows editing for running and sleeping", () => {
    expect(isEndpointEditLocked(LLM_DE_STATUS.RUNNING)).toBe(false);
    expect(isEndpointEditLocked(LLM_DE_STATUS.SLEEPING)).toBe(false);
  });

  it("LoRA edit unlocked for terminated and failed (unlike general edit)", () => {
    expect(isEndpointLoraEditLocked(LLM_DE_STATUS.TERMINATED)).toBe(false);
    expect(isEndpointLoraEditLocked(LLM_DE_STATUS.FAILED)).toBe(false);
    expect(isEndpointLoraEditLocked(LLM_DE_STATUS.RUNNING)).toBe(false);
  });

  it("LoRA edit locked for transitioning states", () => {
    expect(isEndpointLoraEditLocked(LLM_DE_STATUS.DEPLOYING)).toBe(true);
    expect(isEndpointLoraEditLocked(LLM_DE_STATUS.ROLLING)).toBe(true);
  });

  it("exposes the state lists", () => {
    expect(LOCKED_ENDPOINT_EDIT_STATES).toContain(LLM_DE_STATUS.TERMINATED);
    expect(LOCKED_ENDPOINT_LORA_EDIT_STATES).not.toContain(
      LLM_DE_STATUS.TERMINATED,
    );
  });
});
