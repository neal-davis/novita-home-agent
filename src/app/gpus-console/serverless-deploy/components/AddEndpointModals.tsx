import { CurrModal } from "@/app/gpus-console/image/components/addImagePrewarmJob";
import ImageAuth from "@/app/gpus-console/settings/components/imageAuth";
import AddNetworkVolume from "../../storage/components/addNetworkVolume";
import { useEffect, useState } from "react";

function getModalContainer() {
  return document.body;
}

export default function AddEndpointModals({
  showAddImageAuth,
  setShowAddImageAuth,
  addAuthValue,
  showAddNetworkStorageAuth,
  addNetworkStorageAuthValue,
  networkVolumeMountRef,
}: any) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {isMounted && showAddImageAuth.showModal ? (
        <CurrModal
          footer={null}
          open={showAddImageAuth.showModal}
          title={"Add Credential"}
          zIndex={5000}
          styles={{
            mask: { zIndex: 5000 },
            wrapper: { zIndex: 5000 },
          }}
          getContainer={getModalContainer}
          onCancel={() =>
            setShowAddImageAuth({ ...showAddImageAuth, showModal: false })
          }
        >
          <ImageAuth addModelValue={addAuthValue} />
        </CurrModal>
      ) : (
        ""
      )}
      {showAddNetworkStorageAuth.showModal ? (
        <AddNetworkVolume
          openDiag={showAddNetworkStorageAuth.showModal}
          mode="Add"
          info={{}}
          finishOper={addNetworkStorageAuthValue}
          mountContainerRef={networkVolumeMountRef}
        />
      ) : (
        ""
      )}
    </>
  );
}
