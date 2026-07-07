import { LLM_DE_STATUS } from "../DEModelStatus";

// States where endpoint configuration editing is locked.
export const LOCKED_ENDPOINT_EDIT_STATES = [
  LLM_DE_STATUS.PENDING,
  LLM_DE_STATUS.DEPLOYING,
  LLM_DE_STATUS.ROLLING,
  LLM_DE_STATUS.SCALING,
  LLM_DE_STATUS.TERMINATING,
  LLM_DE_STATUS.TERMINATED,
  LLM_DE_STATUS.FAILED,
];

export function isEndpointEditLocked(status: string) {
  return LOCKED_ENDPOINT_EDIT_STATES.includes(status);
}

// LoRA can still be edited before redeploying a terminated or failed endpoint.
export const LOCKED_ENDPOINT_LORA_EDIT_STATES = [
  LLM_DE_STATUS.PENDING,
  LLM_DE_STATUS.DEPLOYING,
  LLM_DE_STATUS.ROLLING,
  LLM_DE_STATUS.SCALING,
  LLM_DE_STATUS.TERMINATING,
];

export function isEndpointLoraEditLocked(status: string) {
  return LOCKED_ENDPOINT_LORA_EDIT_STATES.includes(status);
}
