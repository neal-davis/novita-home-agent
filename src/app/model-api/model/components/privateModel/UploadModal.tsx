import { message } from "@/components/ui/standard/notify";
import Modal from "@/app/components/Modal/Modal";
import styles from "./UploadModal.module.scss";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import DropUpload from "./dropUpload";
import { uploadModel } from "@/api/api";
import Button from "@/app/components/button/Button";
import { getMeta } from "@/api/user";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
import { Switch } from "@/components/ui/switch";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { Input } from "@/components/ui/input";
import { SelectItems } from "@/components/ui/standard/select-items";
import type { UploadFileLike } from "./dropUpload";

// i18n-disable-next-line
const selectContentClassName = "z-[9999]";

const defaultMeta = {
  model_types: [
    {
      name: "lora",
      display_name: "LoRA",
    },
  ],
  model_categories: [
    {
      name: "Other",
      id: 100000,
    },
    {
      name: "Graphic_Logo",
      id: 100001,
    },
    {
      name: "Graphic_VI",
      id: 100002,
    },
    {
      name: "Graphic_Poster",
      id: 100003,
    },
    {
      name: "Graphic_Print_Media",
      id: 100004,
    },
    {
      name: "Graphic_E-commerce",
      id: 100005,
    },
    {
      name: "Graphic_Illustrator",
      id: 100006,
    },
    {
      name: "Graphic_Illustrator_Childbook",
      id: 100007,
    },
    {
      name: "Graphic_PortraitBeauty",
      id: 100008,
    },
    {
      name: "Graphic_Portrait",
      id: 100009,
    },
    {
      name: "Graphic_ACGN",
      id: 100010,
    },
    {
      name: "Graphic_Other",
      id: 100011,
    },
    {
      name: "Games_Concept",
      id: 100012,
    },
    {
      name: "Games_Illustrator",
      id: 100013,
    },
    {
      name: "Fashion_Designer",
      id: 100014,
    },
    {
      name: "Environment_Architect",
      id: 100015,
    },
    {
      name: "Environment_Garden",
      id: 100016,
    },
    {
      name: "Environment_Interior",
      id: 100017,
    },
    {
      name: "Environment_Landscape",
      id: 100018,
    },
    {
      name: "Product_Designer_Electrical",
      id: 100019,
    },
    {
      name: "Industry_Automotive",
      id: 100020,
    },
    {
      name: "Art",
      id: 100021,
    },
    {
      name: "3D_Model",
      id: 100022,
    },
    {
      name: "UI_UE",
      id: 100023,
    },
  ],
  base_models: [
    "SD 1.4",
    "SD 1.5",
    "SD 2.0",
    "SD 2.0 768",
    "SD 2.1",
    "SD 2.1 768",
    "SD 2.1 Unclip",
    "SDXL 0.9",
    "SDXL 1.0",
    "Other",
  ],
  base_model_types: ["Standard", "Inpainting", "Refiner", "Pix2Pix"],
  supported_file_extensions: ["safetensors"],
};
export default function UploadModal({
  visible,
  setVisible,
  copy,
}: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  copy: any;
}) {
  const [formValues, setFormValues] = useState({
    name: "",
    type_name: "",
    category_id: "",
    base_model: "",
    base_model_type: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [model_name, setModelName] = useState<string>("");
  const [is_nsfw, setIsNsfw] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [categoryList, setCategoryList] = useState<
    Array<{
      label: string;
      value: string;
    }>
  >(
    defaultMeta.model_categories.map((item: any) => ({
      label: item.name,
      value: item.id,
    })),
  );
  const [typeList, setTypeList] = useState<
    Array<{
      label: string;
      value: string;
    }>
  >(
    defaultMeta.model_types.map((item: any) => ({
      label: item.display_name,
      value: item.name,
    })),
  );
  const [baseModelList, setBaseModelList] = useState<
    Array<{
      label: string;
      value: string;
    }>
  >(
    defaultMeta.base_models.map((item: any) => ({
      label: item,
      value: item,
    })),
  );
  const [baseModelTypes, setBaseModelTypes] = useState<
    Array<{
      label: string;
      value: string;
    }>
  >(
    defaultMeta.base_model_types.map((item: any) => ({
      label: item,
      value: item,
    })),
  );
  const [fileExtension, setFileExtension] = useState<string[]>(
    defaultMeta.supported_file_extensions,
  );
  const [fileList, setFileList] = useState<UploadFileLike[]>([]);
  const keys = useSelectKeys();
  const updateFormValue = (field: keyof typeof formValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    const regex = /^[A-Za-z0-9_]{1,100}$/;
    if (!formValues.name) {
      errors.name = "Please input your name!";
    } else if (!regex.test(formValues.name)) {
      errors.name =
        "Model name can only contain letters, numbers, and underscores, and cannot exceed 100 characters";
    }
    if (!formValues.type_name) {
      errors.type_name = "Please select type!";
    }
    if (!formValues.category_id) {
      errors.category_id = "Please select category!";
    }
    if (!formValues.base_model) {
      errors.base_model = "Please select base model!";
    }
    if (!formValues.base_model_type) {
      errors.base_model_type = "Please select base model type!";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formValues]);

  const saveForm = useCallback(() => {
    if (keys.length === 0) {
      message.warning("Please add your key first");
      return;
    }
    if (fileList.length === 0) {
      message.warning("Please upload your model first");
      return;
    }
    const fileName = fileList[0].name;
    const fileExtension = fileName.split(".").pop();
    if (!isUpload) {
      message.error("File upload failed, please re-upload!");
      return;
    }
    if (!validateForm()) {
      return;
    }
    const params = {
      ...formValues,
      is_nsfw,
      visibility: "private",
      file_extension: fileExtension,
    };
    uploadModel(keys[0], params).then(() => {
      message.success("Submit success");
      setVisible(false);
    });
  }, [formValues, is_nsfw, keys, fileList, setVisible, isUpload, validateForm]);
  useEffect(() => {
    if (keys.length > 0) {
      getMeta(keys[0]).then((res) => {
        if (Array.isArray(res.model_categories)) {
          setCategoryList(
            res.model_categories.map((item: any) => ({
              label: item.name,
              value: item.id,
            })),
          );
        }
        if (Array.isArray(res.model_types)) {
          setTypeList(
            res.model_types.map((item: any) => ({
              label: item.display_name,
              value: item.name,
            })),
          );
        }
        if (Array.isArray(res.base_models)) {
          setBaseModelList(
            res.base_models.map((item: any) => ({
              label: item,
              value: item,
            })),
          );
        }
        if (Array.isArray(res.base_model_types)) {
          setBaseModelTypes(
            res.base_model_types.map((item: any) => ({
              label: item,
              value: item,
            })),
          );
        }
        if (Array.isArray(res.supported_file_extensions)) {
          setFileExtension(res.supported_file_extensions);
        }
      });
      setFormValues((prev) => ({
        ...prev,
        name: "",
      }));
      setModelName("");
      setIsNsfw(false);
    }
  }, [keys]);
  useEffect(() => {
    if (!visible) {
      setIsUpload(false);
    }
  }, [visible]);
  return (
    <Modal
      open={visible}
      onCancel={() => {
        setVisible(false);
      }}
      width={500}
      title={null}
      footer={null}
      styles={{
        mask: {
          backdropFilter: "blur(4px)",
          background: "rgba(0,0,0,.35)",
        },
      }}
    >
      <div className={styles.upload_form}>
        <div className={styles.form_stack}>
          <FormField label="Name" error={formErrors.name} required>
            <Input
              placeholder={"Enter Name"}
              value={formValues.name}
              onChange={(e) => {
                setModelName(e.target.value);
                updateFormValue("name", e.target.value);
              }}
              disabled={loading || isUpload}
            />
          </FormField>
          <div className={styles.list}>
            <div>
              <FormField label="Type" error={formErrors.type_name} required>
                <SelectItems
                  value={formValues.type_name}
                  placeholder={"Please select"}
                  options={typeList}
                  onChange={(value) => updateFormValue("type_name", value)}
                  contentClassName={selectContentClassName}
                />
              </FormField>
            </div>
            <div>
              <FormField
                label="Category"
                error={formErrors.category_id}
                required
              >
                <SelectItems
                  value={formValues.category_id}
                  placeholder={"Please select"}
                  options={categoryList}
                  onChange={(value) => updateFormValue("category_id", value)}
                  contentClassName={selectContentClassName}
                />
              </FormField>
            </div>
          </div>
          <div className={styles.list}>
            <div>
              <FormField
                label="Base Model"
                error={formErrors.base_model}
                required
              >
                <SelectItems
                  value={formValues.base_model}
                  placeholder={"Please select"}
                  options={baseModelList}
                  onChange={(value) => updateFormValue("base_model", value)}
                  contentClassName={selectContentClassName}
                />
              </FormField>
            </div>
            <div>
              <FormField
                label="Base Model Type"
                error={formErrors.base_model_type}
                required
              >
                <SelectItems
                  value={formValues.base_model_type}
                  placeholder={"Please select"}
                  options={baseModelTypes}
                  onChange={(value) =>
                    updateFormValue("base_model_type", value)
                  }
                  contentClassName={selectContentClassName}
                />
              </FormField>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 mb-[20px]">
            <Switch
              checked={is_nsfw}
              onCheckedChange={(checked: boolean) => {
                setIsNsfw(checked);
              }}
            />{" "}
            <span>{"NSFW(Not Safe For Work)"}</span>
          </div>
        </div>
        <DropUpload
          model_name={model_name}
          setFileList={setFileList}
          fileList={fileList}
          fileExtension={fileExtension}
          setLoading={setLoading}
          setIsUpload={setIsUpload}
        />
        <div
          style={{
            marginTop: "16px",
          }}
        >
          <Button
            type="primary"
            style={{
              height: "40px",
              width: "100%",
            }}
            onClick={saveForm}
            loading={loading}
            id={CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_MGMT_UPLOAD_MODEL_SUBMIT}
          >
            {"Submit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={styles.form_field}>
      <span className={styles.field_label}>
        {required ? <span className={styles.required_mark}>*</span> : null}
        {label}
      </span>
      {children}
      {error ? <span className={styles.field_error}>{error}</span> : null}
    </label>
  );
}
