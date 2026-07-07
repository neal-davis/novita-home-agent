import * as detail from "@/app/models-console/llm-dedicated-endpoints/components/detail";

describe("detail barrel exports", () => {
  it("re-exports all detail components", () => {
    expect(detail.OverviewTab).toBeDefined();
    expect(detail.MetricsTab).toBeDefined();
    expect(detail.SettingsTab).toBeDefined();
    expect(detail.HealthStatus).toBeDefined();
    expect(detail.KeyMetrics).toBeDefined();
    expect(detail.DeployPipeline).toBeDefined();
    expect(detail.QuickStart).toBeDefined();
    expect(detail.RecentActivity).toBeDefined();
    expect(detail.ReplicasInfo).toBeDefined();
    expect(detail.ChangeHistory).toBeDefined();
    expect(detail.InstanceConfig).toBeDefined();
    expect(detail.EngineConfigOverview).toBeDefined();
  });
});
