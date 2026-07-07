import AddTemplateFormBody from "../addTemplateForm/AddTemplateFormBody";
import type { AddTemplateFormBodyProps } from "../addTemplateForm/AddTemplateFormBody";
import styles from "./index.module.scss";

type AddTemplateInPrewarmBodyProps = Omit<
  AddTemplateFormBodyProps,
  "formStyles" | "variant"
>;

export default function AddTemplateInPrewarmBody(
  props: AddTemplateInPrewarmBodyProps,
) {
  return (
    <AddTemplateFormBody {...props} formStyles={styles} variant="prewarm" />
  );
}
