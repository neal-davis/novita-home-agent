import { LegacyButton as Button } from "@/components/ui/standard/legacy-button";
import baseStyles from "../../base.module.scss";
import PrimaryBtn from "../../../button/Button";
import { getGenBtnId } from "@/app/components/analytics/constants";
import { formatMoneyDisplay } from "@/lib/utils/money";

interface FormFooterProps {
  generating: boolean;
  queueing: boolean;
  prompt: string;
  funcInfo: any;
  rootPage: string;
  handleGenerate: () => void;
  cancelTask: () => void;
  estimatePrice?: number;
}

export default function FormFooter({
  generating,
  queueing,
  prompt,
  funcInfo,
  rootPage,
  handleGenerate,
  cancelTask,
  estimatePrice,
}: FormFooterProps) {
  return (
    <div className={baseStyles.btn_group}>
      <PrimaryBtn
        type="secondary"
        className={baseStyles.gen_btn}
        id={getGenBtnId(rootPage)}
        elAttrs={{
          "data-gtm-product-name": funcInfo.name,
        }}
        onClick={handleGenerate}
        loading={generating || queueing}
        disabled={!prompt}
      >
        {"Generate"}
      </PrimaryBtn>
      {(generating || queueing) && (
        <Button
          ghost={true}
          className={baseStyles.cancel_btn}
          onClick={cancelTask}
        >
          {"Cancel"}
        </Button>
      )}
      {estimatePrice && (
        <p className={baseStyles.price_info}>
          Estimated cost:
          <strong>{`$${formatMoneyDisplay(estimatePrice)}/video`}</strong>
        </p>
      )}
    </div>
  );
}
