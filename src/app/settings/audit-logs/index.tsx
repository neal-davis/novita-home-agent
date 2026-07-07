/* eslint-disable */
"use client";
import { useCallback, useEffect, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DateRangePicker from "@/components/ui/standard/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import StandardPagination from "@/components/ui/standard/pagination";
import { ChevronDown, Check } from "lucide-react";
import { getAuditLogs } from "@/api/team";
import { PERMISSION } from "@/constants/constants";
import { useAppSelector } from "@/store";
import { selectResourceStructure } from "@/store/slice/configSlice";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import TeamMemberSelector from "@/app/components/TeamMemberSelector";
import { usePermission } from "@/lib/hooks/usePermission";
import MemberCell from "@/app/components/Table/MemberCell";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
function createCopyGroups() {
  return {
    all: "All",
    account: "Account",
    billing: "Billing",
    gpu_setting: "GPU Instance Setting",
    image: "Image",
    instance: "Instance",
    jobs: "Jobs",
    key_management: "Key Management",
    main_console: "Main Console",
    model_api: "Model API",
    serverless: "Serverless",
    storage: "Storage",
    team: "Team",
    template: "Template",
    vpc: "VPC",
    quota: "Quota",
    playground: "Playground",
  };
}
function createCopyResources() {
  return {
    all: "All",
    real_name_authentication: "Real Name Authentication",
    balance: "Balance",
    vouchers: "Vouchers",
    transactions: "Transactions",
    details: "Billing Details",
    dedicated_endpoints_info: "Dedicated Endpoints Info",
    warning: "Balance Warning",
    budget: "Bill Budget",
    payment_method: "Payment Method",
    recharge: "Recharge",
    auto_recharge: "Auto Recharge",
    ssh_public_keys: "SSH Public Keys",
    container_registry_auth: "Container Registry Auth",
    single_numa: "Single NUMA and Automatic Instance Migration",
    image_push: "Image Push",
    image: "Image",
    image_prewarm: "Image Prewarm",
    instance: "Instance",
    jobs: "Jobs",
    key_management: "Key Management",
    my_service: "My Service",
    billing: "Billing",
    cost: "Cost",
    affiliate: "Affiliate",
    usage: "Usage",
    llm_dedicated_endpoints: "LLM Dedicated Endpoints",
    settings: "Settings",
    overview: "Overview",
    dedicated_endpoints: "Dedicated Endpoints",
    upload_model: "Upload Model",
    dedicated_endpoints_subscribe: "Dedicated Endpoints Subscribe",
    serverless: "Serverless",
    storage: "Storage",
    invite: "Invite",
    audit_log: "Audit Log",
    member: "Member",
    info: "Info",
    template: "Template",
    vpc: "VPC",
    apply_adjust_quota: "Increase Limit",
    playground: "Playground",
    llm_metrics: "LLM Metrics",
    member_basic_info: "Basic Member Info",
    member_name: "Alias",
  };
}
function createResourceCopy() {
  return {
    all: "All",
    resource: "Resource",
    resourceGroup: "Resource Group",
    groups: {
      all: "All",
      account: "Account",
      billing: "Billing",
      gpu_setting: "GPU Instance Setting",
      image: "Image",
      instance: "Instance",
      jobs: "Jobs",
      key_management: "Key Management",
      main_console: "Main Console",
      model_api: "Model API",
      serverless: "Serverless",
      storage: "Storage",
      team: "Team",
      template: "Template",
      vpc: "VPC",
      quota: "Quota",
      playground: "Playground",
    },
    resources: {
      all: "All",
      real_name_authentication: "Real Name Authentication",
      balance: "Balance",
      vouchers: "Vouchers",
      transactions: "Transactions",
      details: "Billing Details",
      dedicated_endpoints_info: "Dedicated Endpoints Info",
      warning: "Balance Warning",
      budget: "Bill Budget",
      payment_method: "Payment Method",
      recharge: "Recharge",
      auto_recharge: "Auto Recharge",
      ssh_public_keys: "SSH Public Keys",
      container_registry_auth: "Container Registry Auth",
      single_numa: "Single NUMA and Automatic Instance Migration",
      image_push: "Image Push",
      image: "Image",
      image_prewarm: "Image Prewarm",
      instance: "Instance",
      jobs: "Jobs",
      key_management: "Key Management",
      my_service: "My Service",
      billing: "Billing",
      cost: "Cost",
      affiliate: "Affiliate",
      usage: "Usage",
      llm_dedicated_endpoints: "LLM Dedicated Endpoints",
      settings: "Settings",
      overview: "Overview",
      dedicated_endpoints: "Dedicated Endpoints",
      upload_model: "Upload Model",
      dedicated_endpoints_subscribe: "Dedicated Endpoints Subscribe",
      serverless: "Serverless",
      storage: "Storage",
      invite: "Invite",
      audit_log: "Audit Log",
      member: "Member",
      info: "Info",
      template: "Template",
      vpc: "VPC",
      apply_adjust_quota: "Increase Limit",
      playground: "Playground",
      llm_metrics: "LLM Metrics",
      member_basic_info: "Basic Member Info",
      member_name: "Alias",
    },
  };
}
type Iprops = {
  copy?: unknown;
};
enum Action {
  All = "all",
  Create = "create",
  Delete = "delete",
  Update = "update",
}
const RESOURCE_GROUPS_SHOULD_SHOW = [
  PERMISSION.RESOURCE_GROUP.billing,
  PERMISSION.RESOURCE_GROUP.gpu_setting,
  PERMISSION.RESOURCE_GROUP.instance,
  PERMISSION.RESOURCE_GROUP.jobs,
  PERMISSION.RESOURCE_GROUP.key_management,
  PERMISSION.RESOURCE_GROUP.serverless,
  PERMISSION.RESOURCE_GROUP.storage,
  PERMISSION.RESOURCE_GROUP.team,
  PERMISSION.RESOURCE_GROUP.template,
  PERMISSION.RESOURCE_GROUP.vpc,
];
const RESOURCES_SHOULD_SHOW = [
  PERMISSION.RESOURCE.recharge,
  PERMISSION.RESOURCE.warning,
  PERMISSION.RESOURCE.container_registry_auth,
  PERMISSION.RESOURCE.single_numa,
  PERMISSION.RESOURCE.ssh_public_keys,
  PERMISSION.RESOURCE.instance,
  PERMISSION.RESOURCE.jobs,
  PERMISSION.RESOURCE.key_management,
  PERMISSION.RESOURCE.serverless,
  PERMISSION.RESOURCE.storage,
  PERMISSION.RESOURCE.info,
  PERMISSION.RESOURCE.invite,
  PERMISSION.RESOURCE.member,
  PERMISSION.RESOURCE.template,
  PERMISSION.RESOURCE.vpc,
];
const getActionLabel = (action: Action) => {
  switch (action) {
    case Action.All:
      return "All";
    case Action.Create:
      return "Create";
    case Action.Delete:
      return "Delete";
    case Action.Update:
      return "Update";
  }
  return "";
};
const getResourceGroupLabel = (group: string, copy?: unknown) => {
  return createCopyGroups()[group as keyof ReturnType<typeof createCopyGroups>];
};
const getResourceLabel = (resource: string, copy?: unknown): string => {
  return createCopyResources()[
    resource as keyof ReturnType<typeof createCopyResources>
  ];
};
type TeamMember = {
  ids: string[];
  email: string;
  phone: string;
};
type Log = {
  id: string;
  timestamp: number;
  email: string;
  phone: string;
  alias: string;
  resourceGroup: string;
  resource: string;
  resourceID: string;
  action: string;
};
const PAGE_SIZE = 20;
interface Option {
  value: string;
  label: string;
  children?: Option[];
}
export default function KeyContainer(props: Iprops) {
  const { copy } = props;
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -20),
    to: new Date(),
  });
  const [filterMember, setFilterMember] = useState<TeamMember | null>(null);
  const [filterAction, setFilterAction] = useState<Action>(Action.All);
  const [filterResource, setFilterResource] = useState<string>("all");
  const [filterResourceGroup, setFilterResourceGroup] = useState<string>("all");
  const [resourceOptions, setResourceOptions] = useState<string[]>([]);
  const [filterResourceOpen, setFilterResourceOpen] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const resourceStructure = useAppSelector(selectResourceStructure);
  const auditLogsPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.team,
    resource: PERMISSION.RESOURCE.audit_log,
    action: PERMISSION.ACTION.read,
  });
  const search = useCallback(
    (page?: number) => {
      if (!auditLogsPermission) {
        return;
      }
      setLoading(true);
      const filter: {
        [key: string]: any;
      } = {};
      if (filterMember !== null) {
        filter.member_id = filterMember.ids.join(",");
      }
      if (filterAction !== Action.All) {
        filter.action = filterAction;
      }
      if (filterResourceGroup !== "all") {
        filter.resource_group = filterResourceGroup;
      }
      if (filterResource !== "all") {
        filter.resource = filterResource;
      }
      getAuditLogs({
        page: page || 1,
        pageSize: PAGE_SIZE,
        startTime: Math.floor((date?.from?.getTime() || 0) / 1000),
        endTime: date?.to
          ? Math.floor(
              new Date(date.to.setHours(23, 59, 59, 999)).getTime() / 1000,
            )
          : Math.floor(Date.now() / 1000),
        filter: filter,
      })
        .then((res) => {
          setLogs(
            res.logs.map((l: any) => {
              return {
                timestamp: l.timestamp,
                email: l.email,
                phone: l.phone,
                alias: l.alias,
                resourceGroup: l.resourceGroup,
                resource: l.resource,
                resourceID: l.resourceID,
                action: l.action,
              };
            }),
          );
          setTotal(res.total);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          message.error("Failed to get audit logs");
        });
    },
    [
      filterMember,
      filterAction,
      filterResource,
      filterResourceGroup,
      date,
      auditLogsPermission,
    ],
  );
  useEffect(() => {
    search();
  }, []);
  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.team}
      resource={PERMISSION.RESOURCE.audit_log}
      action={PERMISSION.ACTION.read}
    >
      <div className="console-card">
        <div className="flex flex-col gap-3">
          <div className="flex max-[1288px]:flex-col items-end max-[1288px]:items-start gap-4">
            <div className="flex flex-row items-end gap-4 max-[620px]:flex-col">
              <div className="flex flex-col gap-1">
                <span className="left-1 -top-5 font-small-console text-muted-foreground">
                  {"Date Range"}
                </span>
                <DateRangePicker
                  className="h-8"
                  startTime={date?.from}
                  endTime={date?.to}
                  onChange={(date) => {
                    setDate(date);
                    analytics.trackClick(
                      CLICK_BTN_IDs.SETTINGS.AUDIT_LOGS_PICK_DATE,
                    );
                  }}
                />
              </div>
              {currentTeam && (
                <div className="flex flex-col gap-1">
                  <span className="left-1 -top-5 font-small-console text-muted-foreground">
                    {"Member"}
                  </span>
                  <TeamMemberSelector
                    className="h-8"
                    onSelect={(member) => {
                      setFilterMember(member);
                      analytics.trackClick(
                        CLICK_BTN_IDs.SETTINGS.AUDIT_LOGS_SELECTED_MEMBER,
                      );
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-row items-end gap-4 max-[620px]:flex-col">
              <div className="flex flex-col gap-1">
                <span className="left-1 -top-5 font-small-console text-muted-foreground">
                  {"Action"}
                </span>
                <Select
                  value={filterAction}
                  onValueChange={(value) => {
                    setFilterAction(value as Action);
                    analytics.trackClick(
                      CLICK_BTN_IDs.SETTINGS.AUDIT_LOGS_SELECTED_ACTION,
                      {
                        action: value,
                      },
                    );
                  }}
                >
                  <SelectTrigger className="w-[120px] h-8">
                    {getActionLabel(filterAction)}
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Action).map((a) => (
                      <SelectItem value={a} key={a}>
                        {getActionLabel(a)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="left-1 -top-5 font-small-console text-muted-foreground">
                  {"Resource"}
                </span>
                <Popover
                  open={filterResourceOpen}
                  onOpenChange={setFilterResourceOpen}
                >
                  <PopoverTrigger className="min-w-[180px] h-8">
                    {getResourceGroupLabel(
                      filterResourceGroup,
                      createResourceCopy(),
                    )}
                    &nbsp;-&nbsp;
                    {getResourceLabel(filterResource, createResourceCopy())}
                    <ChevronDown size={16} className="opacity-50 ml-1" />
                  </PopoverTrigger>
                  <PopoverContent className="min-w-[140px] p-0 flex w-[500px]">
                    <Command className="flex-1">
                      <CommandList>
                        <CommandGroup heading={"Resource Group"}>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setFilterResourceGroup(() => "all");
                              setFilterResource(() => "all");
                              analytics.trackClick(
                                CLICK_BTN_IDs.SETTINGS
                                  .AUDIT_LOGS_SELECTED_RESOURCE,
                                {
                                  resourceGroup: "all",
                                  resource: "all",
                                },
                              );
                              setResourceOptions(() => []);
                            }}
                          >
                            {getResourceGroupLabel("all", createResourceCopy())}
                            {filterResourceGroup === "all" && (
                              <Check size={14} className="ml-auto" />
                            )}
                          </CommandItem>
                          {Object.keys(resourceStructure)
                            .filter((r) =>
                              RESOURCE_GROUPS_SHOULD_SHOW.includes(r),
                            )
                            .map((r) => (
                              <CommandItem
                                key={r}
                                value={getResourceGroupLabel(
                                  r,
                                  createResourceCopy(),
                                )}
                                onSelect={() => {
                                  setFilterResourceGroup(() => r);
                                  setResourceOptions(
                                    () => resourceStructure[r],
                                  );
                                  setFilterResource(() => "all");
                                  analytics.trackClick(
                                    CLICK_BTN_IDs.SETTINGS
                                      .AUDIT_LOGS_SELECTED_RESOURCE,
                                    {
                                      resourceGroup: r,
                                      resource: "all",
                                    },
                                  );
                                }}
                              >
                                {getResourceGroupLabel(r, createResourceCopy())}
                                {filterResourceGroup === r && (
                                  <Check size={14} className="ml-auto" />
                                )}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                    <Command className="flex-1">
                      <CommandList>
                        <CommandGroup heading={"Resource"}>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setFilterResource(() => "all");
                              setFilterResourceOpen(false);
                              analytics.trackClick(
                                CLICK_BTN_IDs.SETTINGS
                                  .AUDIT_LOGS_SELECTED_RESOURCE,
                                {
                                  resourceGroup: filterResourceGroup,
                                  resource: "all",
                                },
                              );
                            }}
                          >
                            {getResourceLabel("all", createResourceCopy())}
                            {filterResource === "all" && (
                              <Check size={14} className="ml-auto" />
                            )}
                          </CommandItem>
                          {resourceOptions
                            .filter((r) => RESOURCES_SHOULD_SHOW.includes(r))
                            .map((r) => (
                              <CommandItem
                                key={r}
                                value={r}
                                onSelect={() => {
                                  setFilterResource(() => r);
                                  setFilterResourceOpen(false);
                                  analytics.trackClick(
                                    CLICK_BTN_IDs.SETTINGS
                                      .AUDIT_LOGS_SELECTED_RESOURCE,
                                    {
                                      resourceGroup: filterResourceGroup,
                                      resource: r,
                                    },
                                  );
                                }}
                              >
                                {getResourceLabel(r, createResourceCopy())}
                                {filterResource === r && (
                                  <Check size={14} className="ml-auto" />
                                )}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button
              size="sl"
              variant="secondary"
              disabled={loading}
              onClick={() => search()}
              id={CLICK_BTN_IDs.SETTINGS.AUDIT_LOGS_SEARCH_LOGS}
            >
              {"Search"}
              {loading && <Loader2 size={16} className="animate-spin ml-2" />}
            </Button>
          </div>
        </div>
        <div className="mt-5">
          <Table loading={loading}>
            {loading && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/50">
                <Loader2 size={40} className="animate-spin" />
              </div>
            )}
            <TableHeader>
              <TableRow>
                <TableHead>{"Timestamp"}</TableHead>
                <TableHead>{"Member"}</TableHead>
                <TableHead>{"Resource Group"}</TableHead>
                <TableHead>{"Resource"}</TableHead>
                <TableHead>{"Resource ID"}</TableHead>
                <TableHead>{"Action"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    {new Date(l.timestamp * 1000).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <MemberCell
                      member={{
                        alias: l.alias,
                        phone: l.phone,
                        email: l.email,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {getResourceGroupLabel(
                      l.resourceGroup,
                      createResourceCopy(),
                    )}
                  </TableCell>
                  <TableCell>
                    {getResourceLabel(l.resource, createResourceCopy())}
                  </TableCell>
                  <TableCell>{l.resourceID}</TableCell>
                  <TableCell>{getActionLabel(l.action as Action)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-5 flex justify-end">
          <StandardPagination
            className="mt-5"
            total={total}
            pageSize={PAGE_SIZE}
            defaultCurrent={page}
            onChange={(page) => {
              setPage(page);
              search(page);
            }}
          />
        </div>
      </div>
    </PermissionWrapper>
  );
}
