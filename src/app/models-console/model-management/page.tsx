import PrivateModel from "@/app/model-api/model/components/privateModel/privateModel";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./page.module.scss";

export default async function UploadModel() {
  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
      resource={PERMISSION.RESOURCE.upload_model}
      action={PERMISSION.ACTION.all}
    >
      <div className={styles.container}>
        <p className="font-body-medium mb-4">Manage your private models</p>
        <div className="console-card">
          <PrivateModel />
        </div>
      </div>
    </PermissionWrapper>
  );
}
