"use client";
import styles from "./section.module.scss";
import { useEffect, useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { message } from "@/components/ui/standard/notify";
// import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import {
  reqGetImageAuths,
  reqUserSSHKeySave,
  reqGetSSHKey,
  reqGetUserSettings,
  reqUpdateUserSettings,
} from "@/api/gpu-instance/settings";
import ImageAuth from "./imageAuth";
import ResetPassword from "./resetPassword";
import DeleteAuth from "./deleteAuth";
import ConfirmSingeNuma from "./confirmSingeNuma";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { showPermissionMessage } from "@/lib/utils/permission";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { useSearchParams } from "next/navigation";
import Modal from "@/app/components/Modal/Modal";
import { cn } from "@/lib/utils";
type SettingsPanelKey = "ssh" | "registry" | "singleNuma";

export default function Section() {
  const searchParam = useSearchParams();
  const autoMigrateSection = searchParam.get("autoMigrateSection");
  const [expandedPanels, setExpandedPanels] = useState<
    Record<SettingsPanelKey, boolean>
  >({
    ssh: true,
    registry: true,
    singleNuma: true,
  });
  const [imageAuthInfo, setImageAuthInfo] = useState({
    showModal: false,
    authInfo: {},
  });
  function addModelValue() {
    setImageAuthInfo({ ...imageAuthInfo, showModal: false });
    initMyAuths();
  }
  const [myAuths, setMyAuths] = useState([]);
  function initMyAuths() {
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
  }
  const [singleNuma, setSingleNuma] = useState(false);
  const [showAuthInfo, setShowAuthInfo] = useState({
    showModal: false,
    authInfo: {},
  });
  const [singleNumaInfo, setSingleNumaInfo] = useState({
    singleNuma: false,
    showConfirmSingeNuma: false,
  });
  useEffect(() => {
    initMyAuths();
    getSSHKeyFun();
    getUserSettings();
    const timeoutHandler = setTimeout(() => {
      if (autoMigrateSection === "1") {
        const autoMigrateSectionElement = document.getElementById(
          "gpu-settings-auto-migrate",
        );
        if (autoMigrateSectionElement) {
          autoMigrateSectionElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 500);
    return () => {
      clearTimeout(timeoutHandler);
    };
  }, [autoMigrateSection]);
  const [sshInfo, setSshInfo] = useState({ key: "" });
  function getUserSettings() {
    return reqGetUserSettings({}).then((res: any) => {
      setSingleNuma(res?.singleNuma || false);
    });
  }
  function updateSShKey() {
    reqUserSSHKeySave(sshInfo)
      .then((res: any) => {})
      .then(() => {
        message.success("success");
      });
  }
  function getSSHKeyFun() {
    reqGetSSHKey().then((res: any) => {
      setSshInfo({ key: res?.key || "" });
    });
  }
  function inputSshInfo(e: any) {
    setSshInfo({ key: e.target.value });
  }
  const [showChangePassword, setShowChangePassword] = useState(false);
  function changeSingleNumaChecked(checked: boolean) {
    if (hasSingleNumaUpdatePermission) {
      setSingleNumaInfo({
        ...singleNumaInfo,
        singleNuma: checked,
        showConfirmSingeNuma: true,
      });
    } else {
      showPermissionMessage();
    }
  }
  function closeConfirmSingeNuma(mark: boolean) {
    setSingleNumaInfo({ ...singleNumaInfo, showConfirmSingeNuma: false });
    if (mark) {
      reqUpdateUserSettings({ singleNuma: singleNumaInfo.singleNuma }).then(
        (res: any) => {
          getUserSettings().then(() => {
            message.success("success");
          });
        },
      );
    }
  }
  function closeDeleteAuthInfo(mark: any) {
    setShowAuthInfo({ ...showAuthInfo, showModal: false });
    if (mark) {
      initMyAuths();
    }
  }
  const hasSshPublicKeysUpdatePermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.gpu_setting,
    resource: PERMISSION.RESOURCE.ssh_public_keys,
    action: PERMISSION.ACTION.update,
  });
  const hasContainerRegistryAuthAddPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.gpu_setting,
    resource: PERMISSION.RESOURCE.container_registry_auth,
    action: PERMISSION.ACTION.create,
  });
  const hasContainerRegistryAuthDeletePermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.gpu_setting,
    resource: PERMISSION.RESOURCE.container_registry_auth,
    action: PERMISSION.ACTION.delete,
  });
  const hasSingleNumaUpdatePermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.gpu_setting,
    resource: PERMISSION.RESOURCE.single_numa,
    action: PERMISSION.ACTION.update,
  });
  const hasImagePushReadPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.gpu_setting,
    resource: PERMISSION.RESOURCE.image_push,
    action: PERMISSION.ACTION.read,
  });
  const togglePanel = (panelKey: SettingsPanelKey) => {
    setExpandedPanels((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }));
  };
  const sectionHeader = (
    panelKey: SettingsPanelKey,
    children: React.ReactNode,
  ) => (
    <div
      aria-expanded={expandedPanels[panelKey]}
      className="flex w-full items-start justify-between p-4 text-left outline-none"
      onClick={() => togglePanel(panelKey)}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-5 w-5 shrink-0 text-[var(--black)] transition-transform",
          expandedPanels[panelKey] ? "rotate-180" : "",
        )}
      />
    </div>
  );
  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <div>
          <div className={styles.sshKey}>
            {sectionHeader(
              "ssh",
              <div className={styles.sshKeySummary}>
                <div className={styles.summaryTitleWrap}>
                  <div className={styles.sshKeyTitle}>{"SSH Public Keys"}</div>
                </div>
              </div>,
            )}
            {expandedPanels.ssh && (
              <div className={styles.panelBody}>
                <div className={styles.sshKeyDesc}>
                  {
                    "Adding Public Keys to your account will allow access to instances using the basic terminal access option via the associated private key. You can add multiple public keys by separating them with a newline."
                  }
                </div>
                <div className={styles.sshKeyDescTxt}>{"SSH Public Key"}</div>
                <div>
                  <Textarea
                    readOnly={!hasSshPublicKeysUpdatePermission}
                    rows={4}
                    className={styles.sshKeyInput}
                    onChange={(e: any) => inputSshInfo(e)}
                    value={sshInfo.key}
                  />
                </div>
                {hasSshPublicKeysUpdatePermission && (
                  <div className={styles.actionGap}>
                    <Button
                      id={CLICK_BTN_IDs.GPUS_CONSOLE.SETTINGS_UPDATE_PUBLIC_KEY}
                      onClick={updateSShKey}
                      className={styles.sshKeyUpdateBtn}
                    >
                      <span className={styles.sshKeyUpdateBtnTxt}>
                        {"Update Public Key"}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {false && hasImagePushReadPermission && (
          <div className={styles.imageUploadSlot}>{/* <ImageUpload /> */}</div>
        )}

        <div className={styles.panelGap}>
          <div className={styles.sshKey}>
            {sectionHeader(
              "registry",
              <div className={styles.repositorySummary}>
                <div className={styles.summaryTitleWrap}>
                  <div className={styles.sshKeyTitle}>
                    {"Container Registry Auth"}
                  </div>
                </div>
              </div>,
            )}
            {expandedPanels.registry && (
              <div className={styles.panelBody}>
                <div className={styles.sshKeyDesc}>
                  {
                    "You can register your container registry credentials here to pull private images from various container registries. Please be aware that we currently only support docker login type credentials. You can add your credentials to a template by registering the credential here and then selecting it from the dropdown when editing or creating your template."
                  }
                </div>
                {hasContainerRegistryAuthAddPermission && (
                  <div className="mb-[var(--spacing-console-16)]">
                    <Button
                      onClick={() =>
                        setImageAuthInfo({ ...imageAuthInfo, showModal: true })
                      }
                      className={styles.sshKeyUpdateBtn}
                    >
                      <span className={styles.sshKeyUpdateBtnTxt}>
                        {"+ Add Credential"}
                      </span>
                    </Button>
                  </div>
                )}
                <div className={styles.credentialTableOuter}>
                  <div className={`w-full overflow-auto ${styles.tableScroll}`}>
                    <Table className={styles.table} aria-label="caption table">
                      <TableHeader className={styles.tableHeader}>
                        <TableRow>
                          <TableHead>
                            <span className={styles.rowTitle}>{"ID"}</span>
                          </TableHead>
                          <TableHead>
                            <span className={styles.rowTitle}>{"Name"}</span>
                          </TableHead>
                          {hasContainerRegistryAuthDeletePermission && (
                            <TableHead>
                              <span className={styles.rowTitle}>
                                {"Action"}
                              </span>
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myAuths.map((row: any) => (
                          <TableRow className={styles.tableRow} key={row.id}>
                            <TableCell>
                              <span className={styles.rowData}>{row.id}</span>
                            </TableCell>
                            <TableCell>
                              <span className={styles.rowData}>{row.name}</span>
                            </TableCell>
                            {hasContainerRegistryAuthDeletePermission && (
                              <TableCell>
                                <span className={styles.rowData}>
                                  {row.id ? (
                                    <Button
                                      aria-label="Delete registry auth"
                                      className={cn("rounded-[6px]")}
                                      onClick={() =>
                                        setShowAuthInfo({
                                          authInfo: row,
                                          showModal: true,
                                        })
                                      }
                                      size="icon"
                                      variant="noborderoutline"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    ""
                                  )}
                                </span>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.panelGap}>
          <div className={styles.sshKey}>
            {sectionHeader(
              "singleNuma",
              <div className={styles.repositorySummary}>
                <div className={styles.summaryTitleWrap}>
                  <div className={styles.sshKeyTitle}>{"Single-Numa"}</div>
                </div>
              </div>,
            )}
            {expandedPanels.singleNuma && (
              <div className={styles.panelBody}>
                <div className={styles.repositoryDesc}>
                  <div className={styles.sshKeyDesc}>
                    {
                      "This policy would allow resource allocation from different NUMA nodes only if there would never be any other way to satisfy that allocation request."
                    }
                  </div>
                  <label className={styles.singleNumaSummary}>
                    <Checkbox
                      checked={singleNuma}
                      onCheckedChange={(checked) =>
                        changeSingleNumaChecked(checked === true)
                      }
                    />
                    <div className={styles.singleNumaTxt}>
                      {"Prefer Single-Numa"}
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {imageAuthInfo.showModal ? (
        <Modal
          footer={null}
          open={imageAuthInfo.showModal}
          title={<div className="font-h6">{"Add Credential"}</div>}
          onCancel={() =>
            setImageAuthInfo({ ...imageAuthInfo, showModal: false })
          }
          classNames={{
            content: styles.modalContent,
          }}
        >
          <ImageAuth
            authInfo={imageAuthInfo.authInfo}
            addModelValue={addModelValue}
          />
        </Modal>
      ) : (
        ""
      )}
      {showAuthInfo.showModal ? (
        <Modal
          centered
          width="608px"
          footer={null}
          open={showAuthInfo.showModal}
          title={null}
          onCancel={() =>
            setShowAuthInfo({ ...showAuthInfo, showModal: false })
          }
          classNames={{
            content: styles.transparentModalContent,
          }}
        >
          <DeleteAuth
            authInfoObj={showAuthInfo.authInfo}
            finishForm={closeDeleteAuthInfo}
          />
        </Modal>
      ) : (
        ""
      )}
      {singleNumaInfo.showConfirmSingeNuma ? (
        <Modal
          centered
          width="608px"
          footer={null}
          open={singleNumaInfo.showConfirmSingeNuma}
          title={null}
          onCancel={() => closeConfirmSingeNuma(false)}
          classNames={{
            content: styles.transparentModalContent,
          }}
        >
          <ConfirmSingeNuma
            singleNuma={singleNumaInfo.singleNuma}
            finishForm={closeConfirmSingeNuma}
          />
        </Modal>
      ) : (
        ""
      )}
      {showChangePassword ? (
        <Modal
          footer={null}
          open={showChangePassword}
          title="Change Password"
          onCancel={() => setShowChangePassword(false)}
        >
          <ResetPassword
            updateModelValue={() => setShowChangePassword(false)}
          />
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
}
