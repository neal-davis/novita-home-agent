"use client";

import { useState, useEffect, useCallback } from "react";
import { message } from "@/components/ui/standard/notify";
import Link from "next/link";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  ENTERPRISE_PLAYGROUND_CONFIG,
  PERMISSION,
} from "@/constants/constants";
import { setPlaygroundConfig } from "@/api/enterprise";
import { useAppSelector } from "@/store";
import enterprisePlanTipsUtils from "@/app/components/EnterprisePlanTips/componentUtils";
import { NOVITA_URL } from "@/constants/urls";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/lib/hooks/usePermission";
import { showPermissionMessage } from "@/lib/utils/permission";
import { Switch } from "@/components/ui/switch";
import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

export default function PlaygroundSwitch() {
  const [isChecked, setIsChecked] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const config = useAppSelector((state) => state.config.enterprise);

  const hasEditPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.model_api,
    resource: PERMISSION.RESOURCE.settings,
    action: PERMISSION.ACTION.all,
  });

  useEffect(() => {
    if (config.playgroundAPIConfig !== undefined) {
      if (
        config.playgroundAPIConfig ===
        ENTERPRISE_PLAYGROUND_CONFIG.USE_ENTERPRISE
      ) {
        setIsChecked(true);
      } else {
        setIsChecked(false);
      }
    }
  }, [config.playgroundAPIConfig]);

  const handleChange = useCallback(
    async (checked: boolean) => {
      if (!hasEditPermission) {
        showPermissionMessage();
        return;
      }
      if (!config.isEnterprisePlan) {
        setConfirmVisible(true);
        return;
      }
      setIsChecked(checked);
      try {
        await setPlaygroundConfig({
          playground_api_config: checked
            ? ENTERPRISE_PLAYGROUND_CONFIG.USE_ENTERPRISE
            : ENTERPRISE_PLAYGROUND_CONFIG.NOT_USE_ENTERPRISE,
        });
        enterprisePlanTipsUtils.setShouldRefreshEnterpriseInfo();
      } catch {
        setIsChecked(!checked);
        message.error("Operation failed");
      }
    },
    [config.isEnterprisePlan, hasEditPermission],
  );

  return (
    <div className="console-card flex flex-col gap-6">
      <p className="font-body text-black">Playground</p>
      <div className="flex gap-2 items-center">
        <Switch
          className={cn(isChecked && "!bg-black")}
          checked={isChecked}
          onCheckedChange={handleChange}
          id={CLICK_BTN_IDs.MODELS_CONSOLE.SETTINGS_PLAYGROUND_SWITCH}
        />
        <span className="font-subtle">Use Dedicated Endpoints Resources</span>
        <Popover open={showPopover} onOpenChange={setShowPopover}>
          <PopoverTrigger asChild>
            <CircleHelp size={18} />
          </PopoverTrigger>
          <PopoverContent side="right" sideOffset={10}>
            <div className="font-subtle">
              <p>
                Please note that this will share your Dedicated Endpoints
                resources with other generations and may affect their
                performance.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Dialog open={confirmVisible} onOpenChange={setConfirmVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dedicated Endpoints Resources</DialogTitle>
          </DialogHeader>
          <div>
            Your current Pay-As-You-Go plan doesn&apos;t include access to
            Enterprise resources. Upgrade to unlock these features.
          </div>
          <DialogFooter>
            <Button
              size="sl"
              variant="outline"
              onClick={() => {
                setConfirmVisible(false);
              }}
              id={CLICK_BTN_IDs.MODELS_CONSOLE.SETTINGS_PLAYGROUND_TIPS_CANCEL}
            >
              Cancel
            </Button>
            <Button
              size="sl"
              variant="secondary"
              asChild
              id={CLICK_BTN_IDs.MODELS_CONSOLE.SETTINGS_PLAYGROUND_TIPS_DE}
            >
              <Link
                href={NOVITA_URL.MODEL_API_PRICING_ENTERPRISE}
                target="_blank"
              >
                Learn More
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
