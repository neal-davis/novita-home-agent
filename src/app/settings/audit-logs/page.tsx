import { Metadata } from "next";
import AuditLogs from "./index";

export const metadata: Metadata = {
  title: "Audit Logs | Novita AI",
};

export default async function AuditLogsPage() {
  return <AuditLogs />;
}
