import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
const navMenuList = {
  "gpu-instance": {
    TemplatesLibrary: "Templates Library",
    Application: "Application",
    Explore: "Explore",
    Manage: "MANAGE",
    Instances: "Instances",
    Serverless: "Serverless GPUs",
    Image: "Image Prewarm",
    Jobs: "Jobs",
    Storage: "Network Volume",
    Templates: "Templates",
    Account: "ACCOUNT",
    Billing: "Billing",
    Settings: "Settings",
  },
  "model-api": {
    Usage: "Usage",
    "Dedicated Endpoints": "Dedicated Endpoints",
    "Upload Model": "Upload Model",
    "LLM Metrics": "LLM Metrics",
    Settings: "Settings",
  },
  settings: {
    Settings: "Settings",
    Team: "Team",
    "Key Management": "Key Management",
    "Audit Logs": "Audit Logs",
    Verify: "Verify",
  },
};
export default function NavOut({
  curRoute,
  data,
  clickCb,
}: {
  curRoute: string;
  data: Array<any>;
  clickCb?: (param: any) => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const navContentRef = useRef<HTMLDivElement>(null);
  const navMenus: any = navMenuList;
  const path = usePathname();
  const businessPath = getPathnameWithoutLocale(path);
  const { locale } = useI18n();
  return (
    <nav
      ref={navRef}
      className="flex flex-col w-[248px] basis-[248px] shrink-0 bg-white z-[200] overflow-hidden p-6 border-r border-[var(--gray-2)]"
    >
      <div
        ref={navContentRef}
        className="flex flex-col gap-2.5 relative justify-start items-stretch overflow-x-hidden overflow-y-auto"
      >
        {data.map((item: any, index: number) => (
          <div key={index} className="flex flex-col gap-2.5">
            {item.title && (
              <div className="font-small-console px-[14px] text-[var(--dark-3)]">
                {item.title.toUpperCase()}
              </div>
            )}
            <div className="flex flex-col gap-2.5 items-stretch">
              {((item?.items || []) as Array<any>).map((func: any) => {
                if (navMenus[curRoute][func.text]) {
                  return (
                    <Link
                      key={func.text}
                      href={getLocalizedPath(func.link, locale)}
                      className={`flex items-center h-[44px] rounded-md cursor-pointer px-[14px] py-3 ${
                        businessPath === func.link || !!func?.isSelected
                          ? "font-subtle-medium bg-[var(--gray-3)]"
                          : "font-subtle"
                      } hover:bg-[var(--gray-3)]`}
                      onClick={() => clickCb && clickCb(func)}
                    >
                      {navMenus[curRoute][func.text] || ""}
                    </Link>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
    // <nav className="flex flex-col w-[248px] basis-[248px] shrink-0 bg-white z-[200] overflow-hidden p-6">
    //   <div className="flex flex-col gap-2.5 relative justify-start items-stretch overflow-x-hidden overflow-y-auto">
    //     {data.map((group: NavGroup) => (
    //       <div key={group.label} className="flex flex-col gap-2.5">
    //         <div className="font-small-console px-[14px] text-[var(--dark-3)]">
    //           {group.label.toUpperCase()}
    //         </div>
    //         <div className="flex flex-col gap-2.5 items-stretch">
    //           {(group.items || []).map((func: NavItem) => {
    //             if (func.hide) return <></>;
    //             return (
    //               <Link
    //                 key={func.path}
    //                 href={func.path}
    //                 className={`flex items-center h-[44px] rounded-md cursor-pointer px-[14px] py-3 ${
    //                   path === func.path || func.altPaths?.includes(path)
    //                     ? "font-body-medium bg-[var(--gray-3)]"
    //                     : "font-body"
    //                 } hover:bg-[var(--gray-3)]`}
    //                 onClick={() => clickCb && clickCb(func)}
    //               >
    //                 {func.title}
    //               </Link>
    //             );
    //           })}
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </nav>
  );
}
