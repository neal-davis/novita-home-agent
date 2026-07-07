"use client";

import ChangeNewTemplateModal from "@/app/gpus-console/explore/components/changeNewTemplate";

export default function ChangeTemplateModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose?: () => void;
  onConfirm?: (params: any) => void;
}) {
  return (
    <ChangeNewTemplateModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
