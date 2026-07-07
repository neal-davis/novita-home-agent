import PlaygroundSwitch from "./components/PlaygroundSwitch";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./page.module.scss";

export default function Page() {
  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
      resource={PERMISSION.RESOURCE.settings}
      action={PERMISSION.ACTION.read}
    >
      <div className={styles.container}>
        <PlaygroundSwitch />
      </div>
    </PermissionWrapper>
  );
}
