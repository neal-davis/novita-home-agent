"use client";

import { FC, useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import "../../product.global.css";
import { LowBalanceModal } from "@/app/components/modals/Modals";
import { DemoProps } from "@/app/components/demos/DemoWrapper";
import { FuncConstants } from "@/app/models/constants/funcs";
import commonStyle from "../../style.module.scss";
import { useSelectKeys } from "@/lib/hooks/useSelectKeys";
import { NOVITA_URL } from "@/constants/urls";
import { usePathname, useRouter } from "next/navigation";

interface DemoConfig {
  key: string;
  label: string;
  funcInfo: FuncConstants;
  renderCase: FC<DemoProps>;
}

interface SingleDemoProps {
  renderCase: FC<DemoProps>;
  funcInfo: FuncConstants;
}

interface MultiDemoProps {
  demos: DemoConfig[];
  defaultActiveKey?: string;
}

type CaseWrapperProps = SingleDemoProps | MultiDemoProps;

function isMultiDemoMode(props: CaseWrapperProps): props is MultiDemoProps {
  return "demos" in props && Array.isArray(props.demos);
}

export default function CaseWrapper(props: CaseWrapperProps) {
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
  const [curApiKey, setCurApiKey] = useState("");
  const [activeKey, setActiveKey] = useState<string>("");

  const keys = useSelectKeys();
  const router = useRouter();
  const path = usePathname();

  const isMultiMode = isMultiDemoMode(props);

  useEffect(() => {
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      setCurApiKey("");
      return;
    }
    if (
      (keys as string[]).length > 0 &&
      (keys as string[]).indexOf(curApiKey) === -1
    ) {
      setCurApiKey(keys[0]);
    }
  }, [keys, curApiKey]);

  useEffect(() => {
    if (isMultiMode) {
      const hash =
        typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      const validKey =
        hash && props.demos.some((d) => d.key === hash)
          ? hash
          : props.defaultActiveKey || props.demos[0]?.key;
      setActiveKey(validKey);
    }
  }, [isMultiMode, props]);

  const handleTabChange = (key: string) => {
    setActiveKey(key);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${key}`);
    }
  };

  const getDemoProps = (funcInfo: FuncConstants): DemoProps => ({
    apiKey: curApiKey,
    funcInfo: funcInfo,
    rootPage: "product",
    onNeedLogin: () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const redirect = hash ? `${path}${hash}` : path;
      router.push(
        `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(redirect)}`,
      );
    },
    onLowBalance: () => {
      setShowLowBalanceModal(true);
    },
    showCancelConfirm: () => {},
  });

  const renderContent = () => {
    if (isMultiMode) {
      return (
        <Tabs value={activeKey} onValueChange={handleTabChange}>
          <TabsList align="left" className="w-full">
            {props.demos.map((demo) => (
              <TabsTrigger key={demo.key} value={demo.key}>
                {demo.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {props.demos.map((demo) => (
            <TabsContent key={demo.key} value={demo.key}>
              {demo.renderCase(getDemoProps(demo.funcInfo))}
            </TabsContent>
          ))}
        </Tabs>
      );
    } else {
      return props.renderCase(getDemoProps(props.funcInfo));
    }
  };

  return (
    <div className={commonStyle.demo_wrapper}>
      <LowBalanceModal
        show={showLowBalanceModal}
        close={() => {
          setShowLowBalanceModal(false);
        }}
      />
      {renderContent()}
    </div>
  );
}
