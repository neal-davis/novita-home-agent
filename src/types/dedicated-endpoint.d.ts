interface LLMDedicatedEndpointGpu {
  count: number;
  name: string;
  cudaVersion?: string;
}

interface LLMDedicatedEndpointResources {
  gpu: LLMDedicatedEndpointGpu;
  cpuNum?: number;
  memory?: number;
  storage?: number;
}

interface LLMDedicatedEndpointScalingPolicy {
  enable: boolean;
  minReplicas: number;
  maxReplicas: number;
  coolDownPeriod: number;
  scaleDownWindow?: number;
  stableWindow?: number;
}

interface LLMDedicatedEndpointEngineConfig {
  maxModelLen?: number;
  maxNumSeqs?: number;
  extraArgs?: string[];
}

interface LLMDedicatedEndpointEngine {
  type: string;
  version: string;
  config: LLMDedicatedEndpointEngineConfig;
}
interface LLMDedicatedEndpointModel {
  provider: string;
  modelAlias?: string;
  modelId: string;
  revision?: string;
  token?: string;
}

interface LLMDedicatedEndpointLora {
  modelId: string;
  provider?: string;
  name?: string;
  revision?: string;
  token?: string;
}

interface LLMDedicatedEndpoint {
  id: string;
  name: string;
  resources: LLMDedicatedEndpointResources;
  scalingPolicy: LLMDedicatedEndpointScalingPolicy;
  engine: LLMDedicatedEndpointEngine;
  baseModel: LLMDedicatedEndpointModel;
  loras: LLMDedicatedEndpointLora[];
  status: string;
  phase?: string;
  healthy: string;
  createUserName: string;
  createUserUuid: string;
  createTime: number;
  url: string;
  replica: number;
  readyReplica: number;
  isSuffixDecodingEnable?: boolean;
  features?: Record<string, string | boolean>;
}

interface LLMDedicatedSpec {
  id: string;
  gpuName: string;
  displayName: string;
  price: number;
  discount: number;
  description: string;
  pricePrecision: number;
}

interface RecommendedEndpointResource {
  cpuNum: number;
  gpuName: string;
  maxGpuCount: number;
  memory: number;
  minGpuCount: number;
  storage: number;
  gpuNums?: number[];
}
interface RecommendedEndpointConfig {
  engineType: string;
  engineVersion: string;
  resources: RecommendedEndpointResource[];
}

interface LLMDedicatedUserInfo {
  currentGpuCount: number;
  maxGpuCount: number;
}
