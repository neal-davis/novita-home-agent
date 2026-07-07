import styles from "./page.module.scss";
import { BillingHistory } from "./components/BillingTable";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
export type BillingHistoryDictProps = {
  copy?: unknown;
};
export default async function page() {
  return (
    <div className={styles.billing_history}>
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.billing}
        resource={PERMISSION.RESOURCE.transactions}
        action={PERMISSION.ACTION.all}
      >
        <BillingHistory />
      </PermissionWrapper>
    </div>
  );
}
