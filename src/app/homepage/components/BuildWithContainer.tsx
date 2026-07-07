import { getBuildWithConfigInServerEnv } from "@/api/config";
import BuiltWith from "./BuiltWith";

export default async function BuildWithContainer() {
  const buildWithConfig = await getBuildWithConfigInServerEnv();
  return <BuiltWith buildWithConfig={buildWithConfig} />;
}
