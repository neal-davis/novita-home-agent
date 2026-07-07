import Modal from "@/app/components/Modal/Modal";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { BaseModalProps } from "./Modals";
import ModelList, {
  ModelListMethods,
} from "@/app/model-api/model/components/modelList/modelList";
type ModelListModalProps = BaseModalProps & {
  wrapClassName: string;
  modelType: ModelType;
  filter?: Record<string, string | boolean | undefined>;
  baseModel?: string;
  defaultBaseModel?: string;
  selectedModelId?: number;
  selectedModelName?: string;
  selectedModelAPIName?: string;
  needDetails?: boolean;
  onModelSelect: (model: Model | ModelDetails) => void;
};
export interface ModelListModalMethods {
  open: () => void;
  close: () => void;
}
const ModelListModal = forwardRef<ModelListModalMethods, ModelListModalProps>(
  (props: ModelListModalProps, ref) => {
    const modelListRef = useRef<ModelListMethods>(null);
    const modelListWrapper = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(props.show);

    useEffect(() => {
      setOpen(props.show);
    }, [props.show]);

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
        setTimeout(() => {
          modelListRef.current?.resizeWrapper();
        }, 0);
      },
      close: () => {
        modelListRef.current?.onClose();
        setOpen(false);
        props.close();
      },
    }));
    return (
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          props.close();
        }}
        width={"80%"}
        className={`modellist_modal ${props.wrapClassName}`}
        centered
        title={"Select model..."}
        styles={{
          mask: {
            backdropFilter: "blur(4px)",
            background: "rgba(0,0,0,.35)",
          },
        }}
        footer={false}
      >
        <div
          className="scrollBar_container"
          ref={modelListWrapper}
          style={{
            overflow: "auto",
            height: "80vh",
            minHeight: "400px",
          }}
        >
          <ModelList
            ref={modelListRef}
            type="dom"
            modelType={props.modelType}
            itemWidth={200}
            needDetails={props.needDetails}
            selectedModelId={props.selectedModelId}
            selectedModelName={props.selectedModelName}
            selectedModelAPIName={props.selectedModelAPIName}
            parentDom={true}
            widthTransition={false}
            onSelect={(modelDetails: ModelDetails | Model) => {
              props.onModelSelect(modelDetails);
            }}
            filter={props.filter}
            fixedBaseModel={props.baseModel}
            defaultBaseModel={props.defaultBaseModel}
          />
        </div>
      </Modal>
    );
  },
);
ModelListModal.displayName = "ModelListModal";
export default ModelListModal;
