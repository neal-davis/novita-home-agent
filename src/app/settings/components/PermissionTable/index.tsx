"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppSelector } from "@/store";
import { selectResourceStructure } from "@/store/slice/configSlice";
import { TeamRole } from "@/store/slice/userSlice";
import { X } from "lucide-react";
import { Check } from "lucide-react";
function createCopyTeamRoles() {
  return {
    all: "All",
    owner: "Owner",
    admin: "Admin",
    developer: "Developer",
    basic: "Basic",
    billing: "Billing",
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
const resourceGroups = {
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
const resourceResources = {
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
export default function PermissionTable({
  copy,
  height,
}: {
  copy?: unknown;
  height?: number;
}) {
  const resourceStructure = useAppSelector(selectResourceStructure);
  const permissionsConfig = useAppSelector(
    (state) => state.config.permissionsConfig,
  );
  return (
    <Table style={height ? { height: height } : {}}>
      <TableHeader className="sticky top-0 bg-white z-10">
        <TableRow>
          <TableHead rowSpan={2}>{"Resource Group"}</TableHead>
          <TableHead rowSpan={2}>{"Resource"}</TableHead>
          {Object.values(TeamRole).map((role) => (
            <TableHead key={role} colSpan={2} className="text-center">
              {createCopyTeamRoles()[role]}
            </TableHead>
          ))}
        </TableRow>
        <TableRow>
          {Object.values(TeamRole).map((role) => (
            <React.Fragment key={`${role}-actions`}>
              <TableCell className="text-center">{"Read"}</TableCell>
              <TableCell className="text-center">{"Write"}</TableCell>
            </React.Fragment>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(resourceStructure).map(([groupKey, resources]) => (
          <React.Fragment key={groupKey}>
            {resources.map((resource, resourceIndex) => {
              const isFirstResource = resourceIndex === 0;
              return (
                <TableRow key={`${groupKey}-${resource}`}>
                  {isFirstResource && (
                    <TableCell rowSpan={resources.length}>
                      {
                        resourceGroups[
                          groupKey as keyof ReturnType<
                            typeof createResourceCopy
                          >["groups"]
                        ]
                      }
                    </TableCell>
                  )}
                  <TableCell>
                    {
                      resourceResources[
                        resource as keyof ReturnType<
                          typeof createResourceCopy
                        >["resources"]
                      ]
                    }
                  </TableCell>
                  {Object.values(TeamRole).map((role) => {
                    const permission = permissionsConfig[role]?.find(
                      (p) =>
                        p.resource_group === groupKey &&
                        p.resource === resource,
                    );
                    const hasRead =
                      permission?.action === "*" ||
                      permission?.action === "read";
                    const hasWrite = permission?.action === "*";
                    return (
                      <React.Fragment key={`${role}-${resource}-actions`}>
                        <TableCell className="text-center">
                          {hasRead ? (
                            <Check className="mx-auto h-4 w-4 text-green-500" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasWrite ? (
                            <Check className="mx-auto h-4 w-4 text-green-500" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              );
            })}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
