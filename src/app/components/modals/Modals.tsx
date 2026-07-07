import Modal from "@/app/components/Modal/Modal";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import styles from "./Modals.module.scss";
import PrimButton from "../button/Button";
export type BaseModalProps = {
  show: boolean;
  close: () => void;
  closable?: boolean;
};
export function LowBalanceModal(props: BaseModalProps) {
  return (
    <Modal
      open={props.show}
      className={styles.model_content}
      footer={null}
      width={480}
      onCancel={() => {
        props.close();
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={styles.title}>{"Your balance is low..."}</span>
          </div>
        </div>
        <div className={styles.desc}>
          {
            "Your balance is low, preventing task completion. Please top up to continue."
          }
        </div>
        <div className="mt-5 mb-5 text-right">
          <Link
            target="_self"
            href={NOVITA_URL.PRICING}
            style={{ marginRight: 20 }}
          >
            <PrimButton type="link" className={styles.pricing_btn}>
              {"Pricing"}
            </PrimButton>
          </Link>
          <Link href={NOVITA_URL.BILLING_OVERVIEW} target="_self">
            <PrimButton
              type="primary"
              className={styles.charge_btn}
              height={34}
            >
              {"Top up"}
            </PrimButton>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
export const AGREE_TERMS_LS_KEY = "agreed_terms_flag";
