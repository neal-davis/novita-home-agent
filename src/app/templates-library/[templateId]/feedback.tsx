import Modal from "@/app/components/Modal/Modal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ConsoleButton } from "@/app/user/components/console-button";
import { Textarea } from "@/components/ui/textarea";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export default function FeedbackModal({
  open,
  templateId,
  onClose,
  onConfirm,
}: {
  open?: boolean;
  templateId?: string;
  onClose?: () => void;
  onConfirm?: (params: any) => void;
}) {
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    if (!open) return;
  }, [open]);

  return (
    <Modal
      title={"Provide Feedback"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div
        className={`border-top bg-[var(--gray-2)] my-4 mx-[-24px] w-[calc(100% + 48px)] h-[1px]`}
      ></div>
      <div className="font-subtle text-[var(--dark-2)]">
        Report the template directly, or tell us more —— your feedback helps us
        do better!
      </div>
      <div className="flex flex-col gap-3 py-4">
        <Textarea
          placeholder="There are other template suggestions..."
          draggable={false}
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
          }}
          className="w-full h-[100px]"
        />
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <Button
          size="sl"
          variant="outline"
          onClick={onClose}
          id={CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_DETAIL_FEEDBACK_CANCEL}
        >
          Cancel
        </Button>
        <ConsoleButton
          size="sl"
          onClick={() => {
            onConfirm?.({
              reason: feedback?.trim() || "",
              templateId,
            });
          }}
          id={CLICK_BTN_IDs.GPUS_CONSOLE.TEMPLATE_DETAIL_FEEDBACK_SUBMIT}
        >
          Submit Feedback
        </ConsoleButton>
      </div>
    </Modal>
  );
}
