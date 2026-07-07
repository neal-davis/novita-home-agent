"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PermissionTable from "../components/PermissionTable";
type IProps = {
  copy?: unknown;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
export default function Permissions({ copy, open, onOpenChange }: IProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1020px] max-w-[1020px]">
        <DialogHeader>
          <DialogTitle>{"Permission Details"}</DialogTitle>
        </DialogHeader>
        <PermissionTable copy={copy} height={600} />
      </DialogContent>
    </Dialog>
  );
}
