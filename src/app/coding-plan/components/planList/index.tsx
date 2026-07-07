"use client";

import ListItem from "./listItem";
import styles from "./index.module.scss";
import {
  getResourcePackSpecsList,
  getResourcePackOrderList,
  getResourcePackUserList,
} from "@/api/coding-plan";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import SuccessSubscribe from "./successSubscribe";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import Rule from "../rule";
import { cn } from "@/lib/utils";

type ResourcePackContextType = {
  updateGlobalData: () => void;
  loading: boolean;
  targetUrl?: string | undefined;
  failTargetUrl?: string | undefined;
};

const ResourcePackContext = createContext<ResourcePackContextType | undefined>(
  undefined,
);

export const useResourcePackContext = () => {
  const context = useContext(ResourcePackContext);
  if (!context) {
    throw new Error(
      "useResourcePackContext must be used within a ResourcePackProvider",
    );
  }
  return context;
};

export default function PlanList({
  showTitle = true,
  targetUrl,
  failTargetUrl,
  className,
}: {
  showTitle?: boolean;
  targetUrl?: string | undefined;
  failTargetUrl?: string | undefined;
  className?: string;
}) {
  const hasResourcePackPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.resource_pack,
    action: PERMISSION.ACTION.all,
  });
  const [resourcePackSpecsList, setResourcePackSpecsList] = useState<any[]>([]);
  const [resourcePackOrderList, setResourcePackOrderList] = useState<any[]>([]);
  const [allValidInstances, setAllValidInstances] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [showSuccessSubscribe, setShowSuccessSubscribe] = useState(false);
  const [showRuleDrawer, setShowRuleDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const updateGlobalData = useCallback(() => {
    setLoading(true);
    getResourcePackSpecsList({})
      .then((res: any) => {
        console.log("getResourcePackSpecsList:", res);
        const resList = (res?.list || []).filter(
          (item: any) => item.type === 1,
        );
        setResourcePackSpecsList(resList || []);
        if (resList.length > 0 && hasResourcePackPermission) {
          getResourcePackOrderList({
            pkgSpecsIds: resList.map((item: any) => Number(item.id)),
          })
            .then(async (resOrders: any) => {
              console.log("getResourcePackOrderList:", resOrders);
              setAllOrders(resOrders?.subscriptions || []);
              let currentResourcePackUserListTmp: any = null;
              try {
                currentResourcePackUserListTmp = await getResourcePackUserList({
                  containsExhausted: true,
                });
              } catch (err: any) {
                currentResourcePackUserListTmp = null;
              }
              console.log(
                "currentResourcePackUserListTmp:",
                currentResourcePackUserListTmp,
              );
              setAllValidInstances(currentResourcePackUserListTmp?.data || []);
              if (currentResourcePackUserListTmp?.data?.length > 0) {
                const currentResourcePackUserListData =
                  currentResourcePackUserListTmp?.data?.filter(
                    (item: any) =>
                      !(
                        item?.status === 9 &&
                        item?.billingCycle === "decrement-based"
                      ),
                  ) || [];
                setResourcePackOrderList(
                  (resOrders.subscriptions || []).filter((order: any) =>
                    currentResourcePackUserListData.some(
                      (item: any) => item.instanceId === order.instanceId,
                    ),
                  ),
                );
              } else {
                if (resOrders.subscriptions?.length > 0) {
                  setResourcePackOrderList(resOrders.subscriptions || []);
                } else {
                  setResourcePackOrderList([]);
                }
              }
              setLoading(false);
            })
            .catch(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [hasResourcePackPermission]);
  useEffect(() => {
    const currentSearchParams = new URLSearchParams(window.location.search);
    if (
      currentSearchParams.has("purchased") &&
      currentSearchParams.get("purchased") === "1"
    ) {
      setShowSuccessSubscribe(true);
      currentSearchParams.delete("purchased");
      const newUrl = `${
        window.location.pathname
      }?${currentSearchParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }
    updateGlobalData();
  }, [updateGlobalData]);
  const judgeReBuy = useCallback(
    (pkgSpecsId: string) => {
      const isExistPkgSpecsIdInOrders = allOrders.find(
        (item: any) => item.pkgSpecsId === pkgSpecsId,
      );
      const isExistPkgSpecsIdInValidInstances = allValidInstances.findLast(
        (item: any) => item.pkgSpecsId === pkgSpecsId,
      );
      if (isExistPkgSpecsIdInOrders && !isExistPkgSpecsIdInValidInstances) {
        return true;
      }
      if (isExistPkgSpecsIdInOrders && isExistPkgSpecsIdInValidInstances) {
        if (
          isExistPkgSpecsIdInValidInstances.status === 9 &&
          isExistPkgSpecsIdInValidInstances.billingCycle === "decrement-based"
        ) {
          return true;
        }
      }
      return false;
    },
    [allValidInstances, allOrders],
  );

  return (
    <ResourcePackContext.Provider
      value={{ updateGlobalData, loading, targetUrl, failTargetUrl }}
    >
      <div className={cn("max_width_container", className)} id="plans">
        <div className="mx-web">
          {showTitle && (
            <div className="flex flex-row justify-between items-center mb-3">
              <div className="font-h4-large text-[var(--black)]">
                {"Choose your plan"}
              </div>

              <Button
                type="button"
                variant="noborderghost"
                size="link"
                onClick={() => setShowRuleDrawer(true)}
                className={styles.terms_text}
              >
                <span>Terms &gt;</span>
              </Button>
            </div>
          )}
          <div className={`${styles.package_list_container}`}>
            {resourcePackSpecsList.map((item: any) => (
              <ListItem
                key={item.id}
                itemData={item}
                isReBuy={judgeReBuy(item.id)}
                orderData={[
                  resourcePackOrderList?.findLast(
                    (order: any) => order.pkgSpecsId === item.id,
                  ) || { instanceId: null, pkgSpecsId: null },
                ]}
              />
            ))}
          </div>
        </div>
        {showSuccessSubscribe && (
          <SuccessSubscribe
            open={showSuccessSubscribe}
            setOpen={setShowSuccessSubscribe}
          />
        )}

        <Drawer
          open={showRuleDrawer}
          onOpenChange={setShowRuleDrawer}
          direction="right"
        >
          <DrawerContent className="right-0 left-auto top-0 bottom-0 h-full w-full max-w-[600px] rounded-none mt-0 inset-y-0">
            <Rule onClose={() => setShowRuleDrawer(false)} />
          </DrawerContent>
        </Drawer>
      </div>
    </ResourcePackContext.Provider>
  );
}
