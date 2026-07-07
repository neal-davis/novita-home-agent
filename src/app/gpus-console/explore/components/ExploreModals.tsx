"use client";

import Modal from "@/app/components/Modal/Modal";
import ConfirmCreate from "./confirmCreate";
import CreateComplish from "./createComplish";
import CustomerInfo from "./customerInfo";
import styles from "./section.module.scss";

export const MyModal = Modal;

type ExploreModalsProps = {
  state: {
    showCustomerInfo: boolean;
    showConnectInfo: any;
    showConfirmCreate: any;
    showParams: any;
  };
  actions: {
    closeUserCompanyInfo: () => void;
    closeConnectInstanceInfo: () => void;
    setShowConnectInfo: (value: any) => void;
    setShowConfirmCreate: (value: any) => void;
    confirmFinish: (mark: any, createInstanceInfo: any) => void;
  };
};

export default function ExploreModals({ state, actions }: ExploreModalsProps) {
  const { showCustomerInfo, showConnectInfo, showConfirmCreate, showParams } =
    state;
  const {
    closeUserCompanyInfo,
    closeConnectInstanceInfo,
    setShowConnectInfo,
    setShowConfirmCreate,
    confirmFinish,
  } = actions;

  return (
    <>
      {showCustomerInfo ? (
        <MyModal
          width="890px"
          className={styles.customerModal}
          footer={null}
          open={showCustomerInfo}
          title={null}
          onCancel={() => closeUserCompanyInfo()}
        >
          <CustomerInfo finishForm={() => closeUserCompanyInfo()} />
        </MyModal>
      ) : (
        ""
      )}
      {showConnectInfo.showModal ? (
        <MyModal
          {...{
            closeIcon: null,
            centered: true,
            width: "890px",
            className: styles.complishModal,
            footer: null,
            open: showConnectInfo.showModal,
            title: null,
            maskClosable: false,
            onCancel: () =>
              setShowConnectInfo((prev: any) => ({
                ...prev,
                showModal: false,
              })),
          }}
        >
          {showConnectInfo.showModal ? (
            <CreateComplish
              showParams={showParams}
              instanceInfo={showConnectInfo.instanceInfo}
              finishForm={closeConnectInstanceInfo}
            />
          ) : (
            <></>
          )}
        </MyModal>
      ) : (
        ""
      )}
      {showConfirmCreate.showModal ? (
        <MyModal
          {...{
            centered: true,
            width: "608px",
            footer: null,
            open: showConfirmCreate.showModal,
            title: null,
            maskClosable: false,
            onCancel: () =>
              setShowConfirmCreate({
                ...showConfirmCreate,
                sumFee: showConfirmCreate.sumFee,
                showModal: false,
              }),
            styles: {
              content: {
                padding: 0,
              },
            },
          }}
        >
          <ConfirmCreate
            sumFee={showConfirmCreate.sumFee}
            createInstanceInfo={showConfirmCreate.createInstanceInfo}
            finishForm={confirmFinish}
          />
        </MyModal>
      ) : (
        ""
      )}
    </>
  );
}
