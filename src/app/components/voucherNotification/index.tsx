"use client";
import { useEffect, useState, useCallback } from "react";
import { notification } from "@/components/ui/standard/notify";
import Cookies from "js-cookie";
import { reqNoticeRead, reqNotices } from "@/api/gpu-instance/console";
import { getVoucherList } from "@/api/user";
import { VoucherModal } from "@/app/billing/overview/components/voucher/VoucherModal";
export default function VoucherNotification() {
  const [openVoucher, setOpenVoucher] = useState(false);
  const [voucherData, setVoucherData] = useState([]);
  const [loading, setLoading] = useState(false);
  const viewVoucherHandler = useCallback((id: string) => {
    reqNoticeRead({ id }).then(() => {
      notification.destroy(id);
    });
    setTimeout(() => {
      setOpenVoucher(true);
    }, 500);
  }, []);
  const getUnReadNotice = useCallback(async () => {
    try {
      const res = await reqNotices({ status: 0 });
      console.log("reqNotices res:", res);
      (res?.data || []).forEach((item: any) => {
        notification.info({
          key: item.id,
          message: (
            <div style={{ fontWeight: 500, marginLeft: "46px", color: "#000" }}>
              {item.title || "New Voucher"}
            </div>
          ),
          description: (
            <div
              style={{ marginTop: "-5px", marginLeft: "46px", color: "#000" }}
            >
              {"Received a new voucher!"}
              &nbsp;
              <a
                href="javascript:void(0)"
                style={{ color: "var(--brand-0)" }}
                onClick={() => viewVoucherHandler(item.id)}
              >
                {"view"}
              </a>
            </div>
          ),
          placement: "bottomRight",
          icon: (
            <img
              alt="voucher"
              style={{
                width: "100px",
                height: "72px",
                marginTop: "-10px",
                marginLeft: "-18px",
              }}
              src="/gpu-instance/tips/gift.gif"
            />
          ),
          duration: 15,
          onClose: () => {
            reqNoticeRead({ id: item.id });
          },
        });
      });
      if (res?.data?.length) {
        setLoading(true);
        try {
          const voucherRes = await getVoucherList();
          if (Array.isArray(voucherRes.data)) {
            setVoucherData(voucherRes.data);
          }
        } catch (error) {
          console.error("Failed to fetch voucher list:", error);
        } finally {
          setLoading(false);
        }
      }
      return res;
    } catch (error) {
      console.error("Failed to fetch unread notices:", error);
      return { data: [] };
    }
  }, [viewVoucherHandler]);
  useEffect(() => {
    const tokenInfo = Cookies.get("token");
    let intervalHandle: NodeJS.Timeout | null = null;
    if (tokenInfo) {
      getUnReadNotice();
      intervalHandle = setInterval(() => {
        getUnReadNotice();
      }, 300000); // 5 minutes
    }
    return () => {
      if (intervalHandle !== null) {
        clearInterval(intervalHandle);
      }
    };
  }, [getUnReadNotice]);
  return (
    <VoucherModal
      open={openVoucher}
      onClose={() => setOpenVoucher(false)}
      data={voucherData}
      title="Voucher details"
      loading={loading}
    />
  );
}
