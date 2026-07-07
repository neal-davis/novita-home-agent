"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/app/components/Modal/Modal";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import CreateSavingsPlan from "./createSavingsPlan";
import EditInstance from "./editInstance";
import SaveImage from "./saveImage";
import JobCreateSuccess from "./jobCreateSuccess";
import MigrateJobCreateSuccess from "./migrateJobCreateSuccess";
import RenewInstance from "./renewInstance";
import AutoRenewInstanceBat from "./autoRenewInstanceBat";
import AutoRenewInstance from "./autoRenewInstance";
import UpgradeInstance from "./upgradeInstance";
import ConnectInstance from "./connectInstance";
import Logs from "./logs";
import StartInstance from "./startInstance";
import RestartInstance from "./restartInstance";
import UnabledStartInstanceNoSource from "./unabledStartInstanceNoSource";
import MigrateInstance from "./migrateInstance";
import AutoMigrateInstance from "./autoMigrateInstance";
import StopInstance from "./stopInstance";
import TerminateInstance from "./terminateInstance";
import MountNetVolume from "./mountNetVolume";
import styles from "./section.module.scss";

const CurrModal = Modal;
const MyModal = Modal;
const MyUpgradeModal = Modal;
const MyModalSavingPlan = Modal;
const fitContentModalProps = {
  centered: true,
  className: styles.modalFitContent,
  footer: null,
  title: null,
} as const;
const autoWidth608ModalProps = {
  centered: true,
  width: "auto",
  className: styles.modalAutoWidth608,
  footer: null,
  title: null,
} as const;

// react-doctor-disable-next-line react-doctor/no-giant-component -- Centralizes legacy modal wiring so parent props stay grouped; modal registry extraction is follow-up work.
export default function InstanceModals({
  state,
  setters,
  handlers,
  loading,
}: any) {
  const {
    updateNameInfo,
    showCustomerInfo,
    showEditInfo,
    showSaveImageInfo,
    showJobCreateSuccessInfo,
    showMigrateJobCreateSuccessInfo,
    showRenewInfo,
    showTransToMonthlyInfo,
    showSetAutoRenewBatInfo,
    showSetAutoRenewInfo,
    showUpgradeInfo,
    showConnectInfo,
    showLogInfo,
    showStartInfo,
    showRestartInfo,
    showUnabledStartInstanceNoSourceInfo,
    showMigrateInstanceInfo,
    showAutoMigrateInfo,
    showStopInfo,
    showTerminateInfo,
    showMountNetVolumeInfo,
  } = state;
  const {
    setUpdateNameInfo,
    setShowCustomerInfo,
    setShowEditInfo,
    setShowSaveImageInfo,
    setShowJobCreateSuccessInfo,
    setShowMigrateJobCreateSuccessInfo,
    setShowRenewInfo,
    setShowTransToMonthlyInfo,
    setShowSetAutoRenewBatInfo,
    setShowSetAutoRenewInfo,
    setShowUpgradeInfo,
    setShowConnectInfo,
    setShowLogInfo,
    setShowStartInfo,
    setShowRestartInfo,
    setShowUnabledStartInstanceNoSourceInfo,
    setShowMigrateInstanceInfo,
    setShowAutoMigrateInfo,
    setShowStopInfo,
    setShowTerminateInfo,
    setShowMountNetVolumeInfo,
  } = setters;
  const {
    updateInstanceNameFun,
    closeUserCompanyInfo,
    closeEditInstanceInfo,
    closeSaveImageInfo,
    closeShowJobCreateSuccessInfo,
    closeShowMigrateJobCreateSuccessInfo,
    closeRenewInstanceInfo,
    closeTransToMonthlyInstanceInfo,
    closeSetAutoRenewBatInstanceInfo,
    closeSetAutoRenewInstanceInfo,
    closeUpgradeInstanceInfo,
    closeConnectInstanceInfo,
    closeLogInfo,
    closeStartInstanceInfo,
    closeRestartInstanceInfo,
    closeShowUnabledStartInstanceNoSourceInfo,
    closeShowMigrateInstanceInfo,
    closeAutoMigrateInstanceInfo,
    closeStopInstanceInfo,
    closeTerminateInstanceInfo,
    closeMountNetVolumeInstanceInfo,
  } = handlers;
  const {
    renewBtnLoading,
    transToMonthlyBtnLoading,
    setAutoRenewBatBtnLoading,
    setAutoRenewBtnLoading,
  } = loading;

  return (
    <>
      {updateNameInfo.showModal ? (
        <CurrModal
          title={"Edit Instance Name"}
          open={updateNameInfo.showModal}
          onCancel={() =>
            setUpdateNameInfo({ ...updateNameInfo, showModal: false })
          }
          footer={[
            <Button
              key={1}
              variant="outline"
              className={styles.cancelBtn}
              onClick={() => {
                setUpdateNameInfo({ ...updateNameInfo, showModal: false });
              }}
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </Button>,
            <Button
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_EDIT_INSTANCE_NAME}
              key={2}
              variant="default"
              className={styles.confirmBtn}
              onClick={updateInstanceNameFun}
            >
              <span className={styles.confirmBtnTxt}>{"Confirm"}</span>
            </Button>,
          ]}
        >
          <Input
            placeholder={"Enter your instance name"}
            value={updateNameInfo.name}
            onChange={(e: any) =>
              setUpdateNameInfo({ ...updateNameInfo, name: e.target.value })
            }
            className={`${styles.instanceNameInput} ${
              !updateNameInfo.name || updateNameInfo.name.trim() === ""
                ? "error-textarea"
                : ""
            }`}
          />
          {(!updateNameInfo.name || updateNameInfo.name.trim() === "") && (
            <div className={"ant-form-item-explain-error"}>
              {"please input valid instance name"}
            </div>
          )}
        </CurrModal>
      ) : (
        ""
      )}
      {showCustomerInfo.showModal ? (
        <MyModalSavingPlan
          width="auto"
          className={styles.modalMaxWidth608}
          footer={null}
          open={showCustomerInfo.showModal}
          title={null}
          onCancel={() =>
            setShowCustomerInfo({ ...showCustomerInfo, showModal: false })
          }
        >
          <CreateSavingsPlan
            instanceInfo={showCustomerInfo.instanceInfo}
            finishForm={() => closeUserCompanyInfo()}
          />
        </MyModalSavingPlan>
      ) : (
        ""
      )}
      {showEditInfo.showModal ? (
        <MyModal
          {...fitContentModalProps}
          open={showEditInfo.showModal}
          onCancel={() =>
            setShowEditInfo({ ...showEditInfo, showModal: false })
          }
          className={`${styles.modalFitContent} ${styles.editModal}`}
        >
          <EditInstance
            instanceInfoObj={showEditInfo.instanceInfo}
            finishForm={closeEditInstanceInfo}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showSaveImageInfo.showModal ? (
        <MyUpgradeModal
          {...fitContentModalProps}
          open={showSaveImageInfo.showModal}
          onCancel={() =>
            setShowSaveImageInfo({ ...showSaveImageInfo, showModal: false })
          }
        >
          <SaveImage
            instanceInfoObj={showSaveImageInfo.instanceInfo}
            finishForm={closeSaveImageInfo}
          />
        </MyUpgradeModal>
      ) : (
        ""
      )}
      {showJobCreateSuccessInfo.showModal ? (
        <MyUpgradeModal
          {...fitContentModalProps}
          open={showJobCreateSuccessInfo.showModal}
          onCancel={() =>
            setShowJobCreateSuccessInfo({
              ...showJobCreateSuccessInfo,
              showModal: false,
            })
          }
        >
          <JobCreateSuccess
            jobInfoObj={showJobCreateSuccessInfo.jobInfo}
            finishForm={closeShowJobCreateSuccessInfo}
          />
        </MyUpgradeModal>
      ) : (
        ""
      )}
      {showMigrateJobCreateSuccessInfo.showModal ? (
        <MyUpgradeModal
          {...fitContentModalProps}
          open={showMigrateJobCreateSuccessInfo.showModal}
          onCancel={() =>
            setShowMigrateJobCreateSuccessInfo({
              ...showMigrateJobCreateSuccessInfo,
              showModal: false,
            })
          }
        >
          <MigrateJobCreateSuccess
            jobInfoObj={showMigrateJobCreateSuccessInfo.jobInfo}
            finishForm={closeShowMigrateJobCreateSuccessInfo}
          />
        </MyUpgradeModal>
      ) : (
        ""
      )}
      {showRenewInfo.showModal ? (
        <MyUpgradeModal
          {...fitContentModalProps}
          open={showRenewInfo.showModal}
          onCancel={() =>
            setShowRenewInfo({ ...showRenewInfo, showModal: false })
          }
        >
          <RenewInstance
            btnLoading={renewBtnLoading}
            instanceInfoObj={showRenewInfo.instanceInfo}
            finishForm={closeRenewInstanceInfo}
            type="renew"
          />
        </MyUpgradeModal>
      ) : (
        ""
      )}
      {showTransToMonthlyInfo.showModal ? (
        <MyUpgradeModal
          {...fitContentModalProps}
          open={showTransToMonthlyInfo.showModal}
          onCancel={() =>
            setShowTransToMonthlyInfo({
              ...showTransToMonthlyInfo,
              showModal: false,
            })
          }
        >
          <RenewInstance
            btnLoading={transToMonthlyBtnLoading}
            instanceInfoObj={showTransToMonthlyInfo.instanceInfo}
            finishForm={closeTransToMonthlyInstanceInfo}
            type="transToMonthly"
          />
        </MyUpgradeModal>
      ) : (
        ""
      )}
      {showSetAutoRenewBatInfo.showModal ? (
        <MyUpgradeModal
          {...fitContentModalProps}
          open={showSetAutoRenewBatInfo.showModal}
          onCancel={() =>
            setShowSetAutoRenewBatInfo({
              ...showSetAutoRenewBatInfo,
              showModal: false,
            })
          }
        >
          <AutoRenewInstanceBat
            btnLoading={setAutoRenewBatBtnLoading}
            instanceIds={showSetAutoRenewBatInfo.instanceIds}
            finishForm={closeSetAutoRenewBatInstanceInfo}
          />
        </MyUpgradeModal>
      ) : (
        ""
      )}
      {showSetAutoRenewInfo.showModal ? (
        <MyUpgradeModal
          {...fitContentModalProps}
          open={showSetAutoRenewInfo.showModal}
          onCancel={() =>
            setShowSetAutoRenewInfo({
              ...showSetAutoRenewInfo,
              showModal: false,
            })
          }
        >
          <AutoRenewInstance
            btnLoading={setAutoRenewBtnLoading}
            instanceIds={showSetAutoRenewInfo.instanceIds}
            instanceInfoObj={showSetAutoRenewInfo.instanceInfo}
            finishForm={closeSetAutoRenewInstanceInfo}
          />
        </MyUpgradeModal>
      ) : (
        ""
      )}
      {showUpgradeInfo.showModal ? (
        <MyUpgradeModal
          centered
          className={styles.modalNoPadding}
          width="min(640px, calc(100vw - 32px))"
          footer={null}
          open={showUpgradeInfo.showModal}
          title={null}
          classNames={{
            body: styles.modalScrollableBody,
          }}
          onCancel={() =>
            setShowUpgradeInfo({ ...showUpgradeInfo, showModal: false })
          }
        >
          <UpgradeInstance
            instanceInfoObj={showUpgradeInfo.instanceInfo}
            finishForm={closeUpgradeInstanceInfo}
          />
        </MyUpgradeModal>
      ) : (
        ""
      )}
      {showConnectInfo.showModal ? (
        <MyModal
          className={`${styles.modalMaxWidth608} ${styles.connectModal}`}
          footer={null}
          open={showConnectInfo.showModal}
          title={null}
          onCancel={() =>
            setShowConnectInfo({ ...showConnectInfo, showModal: false })
          }
        >
          <ConnectInstance
            instanceInfoObj={showConnectInfo.instanceInfo}
            finishForm={() => closeConnectInstanceInfo()}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showLogInfo.showModal ? (
        <MyModal
          width={1100}
          className={styles.logModal}
          footer={null}
          open={showLogInfo.showModal}
          title={null}
          onCancel={() => setShowLogInfo({ ...showLogInfo, showModal: false })}
        >
          <Logs
            instanceInfoObj={showLogInfo.instanceInfo}
            finishForm={() => closeLogInfo()}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showStartInfo.showModal ? (
        <MyModal
          {...autoWidth608ModalProps}
          open={showStartInfo.showModal}
          onCancel={() =>
            setShowStartInfo({ ...showStartInfo, showModal: false })
          }
        >
          <StartInstance
            instanceInfoObj={showStartInfo.instanceInfo}
            finishForm={closeStartInstanceInfo}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showRestartInfo.showModal ? (
        <MyModal
          {...autoWidth608ModalProps}
          open={showRestartInfo.showModal}
          onCancel={() =>
            setShowRestartInfo({ ...showRestartInfo, showModal: false })
          }
        >
          <RestartInstance
            instanceInfoObj={showRestartInfo.instanceInfo}
            finishForm={() => closeRestartInstanceInfo()}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showUnabledStartInstanceNoSourceInfo.showModal ? (
        <MyModal
          {...autoWidth608ModalProps}
          open={showUnabledStartInstanceNoSourceInfo.showModal}
          onCancel={() =>
            setShowUnabledStartInstanceNoSourceInfo({
              ...showUnabledStartInstanceNoSourceInfo,
              showModal: false,
            })
          }
        >
          <UnabledStartInstanceNoSource
            instanceInfoObj={showUnabledStartInstanceNoSourceInfo.instanceInfo}
            finishForm={closeShowUnabledStartInstanceNoSourceInfo}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showMigrateInstanceInfo.showModal ? (
        <MyModal
          {...autoWidth608ModalProps}
          open={showMigrateInstanceInfo.showModal}
          onCancel={() =>
            setShowMigrateInstanceInfo({
              ...showMigrateInstanceInfo,
              showModal: false,
            })
          }
        >
          <MigrateInstance
            instanceInfoObj={showMigrateInstanceInfo.instanceInfo}
            finishForm={closeShowMigrateInstanceInfo}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showAutoMigrateInfo.showModal ? (
        <MyModal
          centered
          width={"auto"}
          className={styles.modalAutoWidth586}
          footer={null}
          open={showAutoMigrateInfo.showModal}
          title={null}
          onCancel={() =>
            setShowAutoMigrateInfo({
              ...showAutoMigrateInfo,
              showModal: false,
            })
          }
        >
          <AutoMigrateInstance
            instanceInfoObj={showAutoMigrateInfo.instanceInfo}
            finishForm={closeAutoMigrateInstanceInfo}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showStopInfo.showModal ? (
        <MyModal
          {...autoWidth608ModalProps}
          open={showStopInfo.showModal}
          onCancel={() =>
            setShowStopInfo({ ...showStopInfo, showModal: false })
          }
        >
          <StopInstance
            instanceInfoObj={showStopInfo.instanceInfo}
            finishForm={() => closeStopInstanceInfo()}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showTerminateInfo.showModal ? (
        <MyModal
          {...autoWidth608ModalProps}
          open={showTerminateInfo.showModal}
          onCancel={() =>
            setShowTerminateInfo({ ...showTerminateInfo, showModal: false })
          }
        >
          <TerminateInstance
            instanceInfoObj={showTerminateInfo.instanceInfo}
            finishForm={closeTerminateInstanceInfo}
          />
        </MyModal>
      ) : (
        ""
      )}
      {showMountNetVolumeInfo.showModal ? (
        <MyModal
          centered
          width={"auto"}
          className={styles.modalAutoWidth600}
          footer={null}
          open={showMountNetVolumeInfo.showModal}
          title={null}
          onCancel={() =>
            setShowMountNetVolumeInfo({
              ...showMountNetVolumeInfo,
              showModal: false,
            })
          }
        >
          <MountNetVolume
            instanceInfoObj={showMountNetVolumeInfo.instanceInfo}
            finishForm={closeMountNetVolumeInstanceInfo}
            bindList={showMountNetVolumeInfo.bindList}
            allVolumeList={showMountNetVolumeInfo.allVolumeList}
          />
        </MyModal>
      ) : (
        ""
      )}
    </>
  );
}
