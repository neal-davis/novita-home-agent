import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import BillingOverviewClient from "./components/BillingOverviewClient";

export default async function Page() {
  return (
    <div>
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.billing}
        resource={PERMISSION.RESOURCE.overview}
        action={PERMISSION.ACTION.all}
      >
        <BillingOverviewClient />
      </PermissionWrapper>
    </div>
  );
}
