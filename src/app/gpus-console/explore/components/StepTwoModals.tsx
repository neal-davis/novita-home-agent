import AddTemplate from "../../components/addTemplate";
import AddNetworkVolume from "../../storage/components/addNetworkVolume";
import { MyModal } from "../../templates/components/section";
import ChangeTemplateModal from "./changeNewTemplate";
import InvalidModal from "./invalidModal";

export default function StepTwoModals({ state, actions }: any) {
  const {
    showVolumeModal,
    openChangeTemplate,
    createInstanceInfo,
    templateListPrivate,
    operateInfo,
    showInvalidModal,
  } = state;
  const {
    finishOper,
    setOpenChangeTemplate,
    changeImageTemplate,
    changeOfficialTemplateCheck,
    finishTemplateOper,
    updateList,
    setShowInvalidModal,
    finishInvalidModal,
  } = actions;

  return (
    <>
      {showVolumeModal && (
        <AddNetworkVolume
          openDiag={showVolumeModal}
          mode={"Add"}
          info={{}}
          finishOper={finishOper}
        />
      )}
      {openChangeTemplate.open && (
        <ChangeTemplateModal
          open={openChangeTemplate.open}
          onClose={() => {
            setOpenChangeTemplate({
              open: false,
            });
          }}
          currentTemplate={createInstanceInfo?.imageObj || null}
          onConfirm={(template: any) => {
            const privateTemplate =
              templateListPrivate?.find(
                (item: any) => item.Id === template.Id,
              ) || null;
            if (
              template.channel === "private" ||
              (template.channel === "community" && privateTemplate)
            ) {
              changeImageTemplate("private", template.Id);
            } else {
              changeOfficialTemplateCheck(template.Id, true);
            }
            setOpenChangeTemplate({
              open: false,
            });
          }}
        />
      )}
      {operateInfo.addOpen ? (
        <AddTemplate
          mode={operateInfo.mode}
          templateObj={operateInfo.templateObj}
          finishForm={finishTemplateOper}
          createPosition={"out"}
          updateList={updateList}
        />
      ) : (
        ""
      )}
      {showInvalidModal && (
        <MyModal
          centered
          width={"auto"}
          style={{
            padding: "0",
            maxWidth: "608px",
            width: "auto !important",
          }}
          footer={null}
          open={showInvalidModal}
          title={null}
          onCancel={() => setShowInvalidModal(false)}
        >
          <InvalidModal finishForm={finishInvalidModal} />
        </MyModal>
      )}
    </>
  );
}
