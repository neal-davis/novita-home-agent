"use client";

import { Table, TableColumn } from "@/app/billing/components/table/Table";
import { balanceFormat } from "@/lib/utils/money";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogContentInner,
} from "@/components/ui/dialog";
import { VoucherItem, formatUnix, formatBusinessTypes } from "./constants";

const columns: TableColumn[] = [
  {
    title: "Voucher",
    dataIndex: "id",
    render(_: unknown, record: VoucherItem) {
      return record?.name;
    },
  },
  {
    title: "Effect Date",
    dataIndex: "effectDate",
    render: (unix: string) => formatUnix(unix),
  },
  {
    title: "Expiration Date",
    dataIndex: "expiryDate",
    render: (unix: string) => formatUnix(unix),
  },
  {
    title: "Balance / Total",
    dataIndex: "balance",
    render: (_: unknown, record: VoucherItem) => {
      return (
        "$" +
        balanceFormat(record.balance) +
        " / " +
        "$" +
        balanceFormat(record.originalValue)
      );
    },
  },
  {
    title: "Applicable Products",
    dataIndex: "businessTypes",
    render: (businessTypes: string[]) => formatBusinessTypes(businessTypes),
  },
  {
    title: "Status",
    dataIndex: "status",
  },
];

export function VoucherModal({
  open,
  onClose,
  data,
  title,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  data: VoucherItem[];
  title: string;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="lg:w-[1000px] lg:min-w-[1000px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogContentInner defaultHeight>
          <Table
            columns={columns}
            data={data}
            rowKey={columns[0].dataIndex}
            loading={loading}
          />
        </DialogContentInner>
      </DialogContent>
    </Dialog>
  );
}
