"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { getVoucherList } from "@/api/user";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { queryBillingGetVoucherNum } from "@/api/buy";
import { VoucherModal } from "@/app/billing/overview/components/voucher/VoucherModal";
import { showPermissionMessage } from "@/lib/utils/permission";

export function useVoucherModal() {
  const hasBillingPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.main_console,
    resource: PERMISSION.RESOURCE.billing,
    action: PERMISSION.ACTION.read,
  });

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [voucherData, setVoucherData] = useState([]);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherNum, setVoucherNum] = useState<voucherNumSchema | undefined>();

  const fetchVoucherNum = useCallback(async () => {
    if (hasBillingPermission) {
      const data = await queryBillingGetVoucherNum();
      setVoucherNum(data);
    }
  }, [hasBillingPermission]);

  const fetchVoucherList = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setVoucherLoading(true);
    }
    try {
      const res = await getVoucherList();
      if (res.totalBalance && Array.isArray(res.data)) {
        setVoucherData(res.data);
      }
    } finally {
      if (showLoading) {
        setVoucherLoading(false);
      }
    }
  }, []);

  // Calculate the count of vouchers with status "valid"
  const validVoucherCount = useMemo(() => {
    return voucherData.filter((item: any) => item.status === "valid").length;
  }, [voucherData]);

  const handleVoucherModalOpen = useCallback(() => {
    if (!hasBillingPermission) {
      showPermissionMessage();
      return;
    }
    setVoucherModalOpen(true);
    fetchVoucherList(true);
  }, [fetchVoucherList, hasBillingPermission]);

  const InjectModalElement = useMemo(() => {
    return (
      <VoucherModal
        open={voucherModalOpen}
        onClose={() => setVoucherModalOpen(false)}
        data={voucherData}
        title="Voucher details"
        loading={voucherLoading}
      />
    );
  }, [voucherModalOpen, voucherData, voucherLoading]);

  useEffect(() => {
    fetchVoucherNum();
  }, [fetchVoucherNum]);

  // Fetch voucher list on initialization to calculate valid count (without showing loading)
  useEffect(() => {
    if (hasBillingPermission) {
      fetchVoucherList(false);
    }
  }, [hasBillingPermission, fetchVoucherList]);

  return {
    voucherModalOpen,
    voucherNum:
      voucherData.length > 0 ? { num: validVoucherCount } : voucherNum,
    InjectModalElement,
    hasBillingPermission,
    handleVoucherModalOpen,
  };
}
