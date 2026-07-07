import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import { ClientTable } from "./components/ClientTable";
import styles from "./page.module.scss";

export default function Page() {
  return (
    <div className={styles.page_wrap}>
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.billing}
        resource={PERMISSION.RESOURCE.warning}
        action={PERMISSION.ACTION.all}
      >
        <ClientTable />
      </PermissionWrapper>
    </div>
  );
}
