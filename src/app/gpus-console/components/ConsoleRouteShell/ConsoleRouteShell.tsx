"use client";

import { useContext, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { getPathnameWithoutLocale } from "@/i18n/config";
import { checkGroupPermissions } from "@/lib/utils/permission";
import NoPermission from "@/app/components/Permission/noPermission";
import styles from "./ConsoleRouteShell.module.scss";
import PlaygroundWrapper from "../PlaygroundWrapper";
import Disabled from "../Disabled/Disabled";
import { KeyContext } from "../../lib/context";
import type { FuncConstants } from "../../constants/funcs";
import { GPU_SCROLL_CONTAINER_CLASS_NAME } from "../../utils/scroll";

type ConsoleFunc = FuncConstants & {
  link: string;
  text?: string;
  name: string;
};

const routePermissions: Record<string, string | null> = {
  application: "instance",
  "serverless-deploy": "instance",
  explore: "instance",
  "templates-library": "template",
  instances: "instance",
  serverless: "instance",
  image: "image",
  jobs: "jobs",
  storage: "storage",
  templates: "template",
  billing: "billing",
  savingsPlans: null,
  settings: "gpu_setting",
};

function findFuncByPath(
  businessPath: string,
  allFuncsNew: Array<{ items?: ConsoleFunc[] }>,
) {
  for (const group of allFuncsNew) {
    const currentFunc = group?.items?.find((item: ConsoleFunc) => {
      const link = item?.link || "";
      return link && (businessPath + "/").startsWith(link + "/");
    });

    if (currentFunc) {
      return currentFunc;
    }
  }

  return null;
}

function getRouteSegment(businessPath: string) {
  const segments = businessPath.split("/").filter(Boolean);
  return segments[0] === "gpus-console" ? segments[1] || "explore" : "";
}

export default function ConsoleRouteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const businessPath = getPathnameWithoutLocale(pathname);
  const routeSegment = getRouteSegment(businessPath);
  const { func, setFunc, allFuncsNew } = useContext(KeyContext);

  const currentFunc = useMemo(
    () => findFuncByPath(businessPath, allFuncsNew || []),
    [businessPath, allFuncsNew],
  );
  const permissionKey = routePermissions[routeSegment];
  const groupPermissions: Record<string, boolean> = checkGroupPermissions([
    "serverless_deploy",
    "instance",
    "image",
    "storage",
    "template",
    "jobs",
    "billing",
    "gpu_setting",
  ]);

  useEffect(() => {
    if (currentFunc && func !== currentFunc.name) {
      setFunc(currentFunc.name);
    }
  }, [currentFunc, func, setFunc]);

  const canAccess =
    permissionKey === null ? true : Boolean(groupPermissions[permissionKey]);

  if (!currentFunc) {
    return (
      <div className={styles.playground}>
        <div className={styles.body}>
          <div
            className={`${styles.bodyContent} ${GPU_SCROLL_CONTAINER_CLASS_NAME}`}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playground}>
      <div className={styles.body}>
        <div
          className={`${styles.bodyContent} ${GPU_SCROLL_CONTAINER_CLASS_NAME}`}
        >
          {!currentFunc.playgroundReady ? (
            <Disabled func={currentFunc} />
          ) : canAccess ? (
            <PlaygroundWrapper
              curFunc={currentFunc}
              renderCase={() => children}
            />
          ) : (
            <NoPermission />
          )}
        </div>
      </div>
    </div>
  );
}
