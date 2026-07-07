"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Ellipsis } from "lucide-react";
import { NOVITA_URL } from "@/constants/urls";
import styles from "../page.module.scss";
import { message } from "@/components/ui/standard/notify";
import {
  cancelEnterprisePlan,
  queryEnterprisePlanRecord,
  updateEnterprisePlanBillingMethod,
} from "@/api/enterprise";
import dayjs from "dayjs";
import ResultModal from "@/app/components/resultModal/resultModal";
import { Button } from "@/components/ui/button";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Alert from "@/components/ui/standard/alert";
import { NoData } from "@/components/ui/standard/no-data";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SelectBillingMethod, {
  BillingMethodEnum,
} from "@/app/dedicated-endpoint-order/components/SelectBillingMethod";
import { useDispatch } from "react-redux";
import { fetchEnterprise } from "@/store/slice/configSlice";
import { useAppSelector } from "@/store";
import { CircleHelp as QuestionCircleOutlined } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { usePermission } from "@/lib/hooks/usePermission";

export default function EnterpriseTable() {
  const dispatch = useDispatch();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectUUID, setSelectUUID] = useState<string>("");
  const [open, setOpen] = useState(false);

  const [method, setMethod] = useState<{
    type: BillingMethodEnum;
    data: any;
  }>({
    type: BillingMethodEnum.CARD,
    data: null,
  });
  const [openMethodDialog, setOpenMethodDialog] = useState(false);

  const { billingMethod } = useAppSelector((state) => state.config.enterprise);

  // Check permission first
  const hasPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.model_api,
    resource: PERMISSION.RESOURCE.dedicated_endpoints,
    action: PERMISSION.ACTION.all,
  });

  const fetchList = useCallback((needLoading?: boolean) => {
    needLoading && setLoading(true);
    queryEnterprisePlanRecord()
      .then((res) => {
        if (res && Array.isArray(res.enterprisePlanRecordList)) {
          setData(res.enterprisePlanRecordList);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activedLength = useMemo(() => {
    return data.filter((one) => one.status === "Actived").length;
  }, [data]);

  const cancelPlan = useCallback(() => {
    cancelEnterprisePlan({
      uuid: selectUUID,
    }).then(() => {
      message.success("Cancel plan successfully");
      fetchList();
      setOpen(false);
    });
  }, [fetchList, selectUUID]);

  const handleSelectBillingMethod = useCallback(
    (type: BillingMethodEnum, data: any) => {
      setMethod({ type, data });
    },
    [],
  );

  useEffect(() => {
    // Only start timer if user has permission
    if (!hasPermission) return;

    const timer = setInterval(() => {
      fetchList();
    }, 1000 * 3);
    fetchList(true);
    return () => {
      clearInterval(timer);
    };
  }, [fetchList, hasPermission]);

  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
      resource={PERMISSION.RESOURCE.dedicated_endpoints}
      action={PERMISSION.ACTION.all}
    >
      <div className={styles.container}>
        <div className="console-card">
          <div className={styles.title}>
            <span className="font-h5">
              You have{" "}
              <span className="text-[var(--brand-0)]">{data.length}</span>{" "}
              Plans,{" "}
              <span className="text-[var(--brand-0)]">{activedLength}</span>{" "}
              actived.
            </span>
            <div className="flex gap-4">
              <Button
                asChild
                id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_BUY_NOW}
                size="sl"
              >
                <Link href={NOVITA_URL.MODEL_API_PRICING_ENTERPRISE}>
                  Buy Now
                </Link>
              </Button>
              <Dialog
                open={openMethodDialog}
                onOpenChange={setOpenMethodDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_BILLING_METHOD}
                    size="sl"
                  >
                    Billing Method
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[568px]">
                  <DialogHeader>
                    <DialogTitle>Change Billing Methods</DialogTitle>
                  </DialogHeader>
                  <div className="text-black text-[12px] my-4">
                    {`Important: Once you select the billing method for your current
                    plan, all previous plans will automatically switch to the same
                    billing method.`}
                  </div>
                  <div className="mb-6">
                    <div className="font-subtle text-[var(--dark-2)] mb-2">
                      Billing Methods
                    </div>
                    <SelectBillingMethod onSelect={handleSelectBillingMethod} />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOpenMethodDialog(false)}
                      id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_BILLING_METHOD_CANCEL}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="w-[264px]"
                      onClick={() => {
                        updateEnterprisePlanBillingMethod({
                          billingMethod: method.type,
                        }).then(() => {
                          message.success("Update billing method successfully");
                          setOpenMethodDialog(false);
                          dispatch(fetchEnterprise() as any);
                        });
                      }}
                      id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_BILLING_METHOD_SAVE}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="link"
                asChild
                id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_INVOICE_DETAIL}
                size="sl"
              >
                <Link href={NOVITA_URL.BILLING_TRANSACTIONS}>
                  Invoice details
                </Link>
              </Button>
            </div>
          </div>
          <Alert
            title="Our Enterprise Plan is now Dedicated Endpoints."
            content={[
              `We've also reduced prices!`,
              <>
                The Standard Plan is now <span>$559 (previously $799)</span> and
                the Pro Plan is now <span>$1,199 (previously $1,599)</span>.
              </>,
              `Enjoy the same great service at these new lower prices. The new prices will automatically take effect at your next subscription renewal.`,
            ]}
          />
          <Table className="mt-5" loading={loading}>
            {loading && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/50">
                <Loader2 size={40} className="animate-spin" />
              </div>
            )}
            <TableHeader>
              <TableRow>
                <TableHead>Plan Id</TableHead>
                <TableHead>Dedicated Endpoints</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Renewal date</TableHead>
                <TableHead>
                  <HoverCard openDelay={100}>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-1 cursor-pointer">
                        Billing Method
                        <QuestionCircleOutlined
                          className={styles.tipsQuestion}
                        />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <div className="text-common-dark-1">
                        This field indicates the billing method for the next
                        renewal cycle. It follows the most recent subscription
                        order by default. You can also update the billing method
                        in the Dedicated Endpoint management page.
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Operation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.uuid}>
                  <TableCell>{item.uuid}</TableCell>
                  <TableCell>{item.plan_name}</TableCell>
                  <TableCell>
                    {`$${item.price.toFixed(2)} / ${item.unit}`}
                  </TableCell>
                  <TableCell>
                    {item.renewal_at < 0
                      ? "-"
                      : item.is_cancel
                        ? "Expiration on " +
                          dayjs(Number(item.renewal_at) * 1000).format(
                            "YYYY-MM-DD",
                          )
                        : dayjs(Number(item.renewal_at) * 1000).format(
                            "YYYY-MM-DD",
                          )}
                  </TableCell>
                  <TableCell>
                    {billingMethod === BillingMethodEnum.CARD
                      ? "Credit Card"
                      : "Account Balance"}
                  </TableCell>
                  <TableCell>
                    {item.status == "Actived" ? (
                      <span className="text-[var(--brand-1)]">Activated</span>
                    ) : (
                      <span>{item.status}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.status === "Actived" && !item.is_cancel && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="text" size="icon">
                            <Ellipsis size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onSelect={() => {
                              if (item.status !== "Actived") {
                                message.warning(
                                  "Only active plan can be canceled",
                                );
                                return;
                              }
                              setSelectUUID(item.uuid);
                              setOpen(true);
                            }}
                          >
                            Cancel Plan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!loading && data.length === 0 && (
            <div className="flex flex-col items-center gap-5">
              <div className="min-h-[300px] flex flex-col justify-center items-center">
                <NoData />
              </div>
              <p className="font-sutble">
                You need an Dedicated Endpoints subscription to manage this
                page.
              </p>
              <Link
                href={NOVITA_URL.MODEL_API_PRICING_ENTERPRISE}
                target="_blank"
                className={`${styles.tipsLink} flex flex-row justify-between items-center`}
              >
                <Button
                  variant="link"
                  id={CLICK_BTN_IDs.MODELS_CONSOLE.DE_PRICING_LINK}
                >
                  Learn more on our Dedicated Endpoints overview page {">>"}
                </Button>
              </Link>
            </div>
          )}
          <ResultModal
            status="warning"
            open={open}
            setOpen={setOpen}
            width={600}
          >
            <div className={styles.result_modal}>
              <div className={styles.title}>{"We're sorry to see you go!"}</div>
              <div className={styles.description}>
                After confirming your subscription cancellation, please note
                that auto-renewal will be discontinued at the end of the current
                subscription period.
              </div>
              <div className={styles.help}>Need help?</div>
              <div className={styles.contact}>
                Click to <a href="mailto:sales@novita.ai"> contact Sales</a>
              </div>
              <div className={styles.footer}>
                <div className="inline-flex items-center gap-[var(--spacing-button)]">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                    }}
                    style={{
                      width: "180px",
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      cancelPlan();
                    }}
                    style={{
                      width: "180px",
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          </ResultModal>
        </div>
      </div>
    </PermissionWrapper>
  );
}
