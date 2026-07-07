import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { getVoucherList } from "@/api/user";
import styles from "./Share.module.scss";
import { VoucherModal } from "@/app/billing/overview/components/voucher/VoucherModal";
import Big from "big.js";

interface ShareProps {
  code: string;
  inviteCount: number;
  registerCommissions: number;
  commissions: number;
  voucherTemplateIds: string[];
}

const Share: React.FC<ShareProps> = ({
  inviteCount,
  commissions,
  registerCommissions,
  voucherTemplateIds,
}) => {
  const [openVoucher, setOpenVoucher] = useState(false);
  const [voucherData, setVoucherData] = useState([]);

  const queryVoucher = useCallback(() => {
    if (!voucherTemplateIds.length) {
      return;
    }
    getVoucherList(voucherTemplateIds).then((res) => {
      if (res.totalBalance && Array.isArray(res.data)) {
        setVoucherData(res.data);
      }
    });
  }, [voucherTemplateIds]);

  useEffect(() => {
    queryVoucher();
  }, [queryVoucher]);

  return (
    <div className={styles.share}>
      <div className="max_width_container relative">
        <div className={styles.bg}></div>

        <div className="mx-web relative z-1">
          <div
            className={`flex flex-row justify-between items-end gap-3 flex-wrap ${styles.invite_data_title}`}
          >
            <h3>Referral tracker</h3>
            <Link
              className={styles.link}
              href={NOVITA_URL.MODEL_API_LLM_PLAYGROUND}
              target="_blank"
            >
              Try out LLM APIs now
              <span className="iconfont icon-right"></span>
            </Link>
          </div>
          <div
            className={`${styles.invite_data_box} flex flex-row flex-wrap gap-4 justify-between`}
          >
            <div className={styles.data_card}>
              <h4
                onClick={() => setOpenVoucher(true)}
                className="cursor-pointer"
              >
                $
                {Big(
                  Number(commissions || 0) + Number(registerCommissions || 0),
                )
                  .div(10000)
                  .toString()}
              </h4>
              <p className={styles.data_title}>Total reward</p>
              <p className={styles.data_description}>
                Your cumulative reward voucher amount. For your remaining
                balance, visit Billing.
              </p>
            </div>
            <div className={styles.data_card}>
              <h4>{inviteCount}</h4>
              <p className={styles.data_title}>Referrals</p>
              <p className={styles.data_description}>
                {"The total number of users you've referred."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <VoucherModal
        open={openVoucher}
        onClose={() => {
          setOpenVoucher(false);
        }}
        data={voucherData}
        title="Total reward"
        loading={false}
      />
    </div>
  );
};

export default Share;
