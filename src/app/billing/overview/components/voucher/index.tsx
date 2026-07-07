"use client";

import { useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { NoData } from "@/components/ui/standard/no-data";
import { Loader2 } from "lucide-react";
import { balanceFormat } from "@/lib/utils/money";
import { VoucherRedeemModal } from "./VoucherRedeemModal";
import { VoucherItem, formatUnix, formatBusinessTypes } from "./constants";

type StatusFilter = "all" | VoucherItem["status"];

const DEFAULT_DISPLAY_ROWS = 5;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "valid", label: "Valid" },
  { value: "used", label: "Used" },
  { value: "expired", label: "Expired" },
] as const;

const STATUS_BADGE_CONFIG: Record<
  string,
  { bg: string; text: string; color: string }
> = {
  valid: {
    bg: "bg-[var(--brand-3)]",
    text: "text-[var(--brand-1)]",
    color: "bg-[var(--brand-0)]",
  },
  used: {
    bg: "bg-[var(--gray-3)]",
    text: "text-[var(--dark-3)]",
    color: "bg-[var(--dark-3)]",
  },
  expired: {
    bg: "bg-[var(--red-7)]",
    text: "text-[var(--red-2)]",
    color: "bg-[var(--red-2)]",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.used;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm ${s.bg} ${s.text} font-small`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.color}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface VoucherDetailsProps {
  data: VoucherItem[];
  loading: boolean;
  redeemOpen: boolean;
  onRedeemClose: () => void;
  onRedeemSuccess: () => void;
  hasCard?: boolean;
  welcomeVoucherEligible?: boolean;
  onAddCard?: () => void;
}

export default function Voucher({
  data,
  loading,
  redeemOpen,
  onRedeemClose,
  onRedeemSuccess,
  hasCard = true,
  welcomeVoucherEligible = false,
  onAddCard,
}: VoucherDetailsProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expanded, setExpanded] = useState(false);

  const allFiltered = useMemo(() => {
    return statusFilter === "all"
      ? data
      : data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

  const displayData = expanded
    ? allFiltered
    : allFiltered.slice(0, DEFAULT_DISPLAY_ROWS);

  const hasMore = allFiltered.length > DEFAULT_DISPLAY_ROWS;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-body-medium text-[var(--black)]">
          Voucher Details
        </span>
      </div>

      <Select
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <SelectTrigger className="w-[200px] h-9 border-[var(--gray-2)] bg-[var(--white)] hover:border-[var(--brand-0)] mb-3">
          <div>
            <span className="font-subtle text-[var(--dark-2)] mr-1">
              Status:
            </span>
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="rounded-[var(--small-radius)] border border-[var(--gray-2)] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-0)]" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="h-10 bg-[var(--gray-3)]">
                <TableHead className="pl-3">Voucher</TableHead>
                <TableHead>Effect Date</TableHead>
                <TableHead>Expiration Date</TableHead>
                <TableHead>Balance / Total</TableHead>
                <TableHead>Applicable Products</TableHead>
                <TableHead className="pr-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-subtle text-[var(--dark-1)] pl-3">
                    {record.name}
                  </TableCell>
                  <TableCell className="font-subtle text-[var(--dark-1)]">
                    {formatUnix(record.effectDate)}
                  </TableCell>
                  <TableCell className="font-subtle text-[var(--dark-1)]">
                    {formatUnix(record.expiryDate)}
                  </TableCell>
                  <TableCell className="font-subtle text-[var(--dark-1)]">
                    ${balanceFormat(record.balance)} / $
                    {balanceFormat(record.originalValue)}
                  </TableCell>
                  <TableCell className="font-subtle text-[var(--dark-1)]">
                    {formatBusinessTypes(record.businessTypes || [])}
                  </TableCell>
                  <TableCell className="pr-3">
                    <StatusBadge status={record.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!loading && displayData.length === 0 && (
          <div className="w-full flex justify-center items-center">
            <div className="min-h-[200px] flex flex-col justify-center items-center gap-7 py-6">
              {!hasCard && welcomeVoucherEligible ? (
                <>
                  <img
                    src="/billing/voucher-no-data.png"
                    alt="no voucher"
                    className="w-[259px] h-[119px] object-contain"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-body-medium text-[var(--black)]">
                      No Data
                    </span>
                    <span className="font-small text-[var(--dark-3)]">
                      Bind a card to receive your $1 Model API Voucher
                    </span>
                    <Button
                      variant="default"
                      size="sl"
                      className="h-[32px] px-3 mt-1"
                      onClick={onAddCard}
                    >
                      Bind Card
                    </Button>
                  </div>
                </>
              ) : (
                <NoData />
              )}
            </div>
          </div>
        )}
      </div>

      {!loading && hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="link"
            size="sl"
            className="h-auto p-0 font-subtle"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : `View all ${allFiltered.length} vouchers`}
          </Button>
        </div>
      )}

      <VoucherRedeemModal
        open={redeemOpen}
        onClose={onRedeemClose}
        onSuccess={onRedeemSuccess}
      />
    </div>
  );
}
