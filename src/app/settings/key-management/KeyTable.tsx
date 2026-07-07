"use client";
import { deleteUserKey } from "@/api/user";
import { cn } from "@/lib/utils";
import { message } from "@/components/ui/standard/notify";
import { useState } from "react";
import DelKeyModal from "./DelKeyModal";
import styles from "./index.module.scss";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import MemberCell from "@/app/components/Table/MemberCell";
import { APIKey } from "./index";
import { PencilLine, Trash2 } from "lucide-react";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import dayjs from "dayjs";
const transformStr = (str: string) => {
  if (str.length < 23) {
    return str;
  }
  const prefix = str.slice(0, 9);
  const suffix = str.slice(23);
  const stars = "*".repeat(4);
  return prefix + stars + suffix;
};
const formatLastUsedAt = (lastUsedAt: string | number | null) => {
  console.log("lastusedat.........", lastUsedAt);
  if (!lastUsedAt || lastUsedAt === "-1" || lastUsedAt === 0) {
    return "Never used";
  }
  // Handle timestamp (Unix timestamp in seconds)
  if (typeof lastUsedAt === "number" || !isNaN(Number(lastUsedAt))) {
    return dayjs.unix(Number(lastUsedAt)).format("YYYY-MM-DD HH:mm:ss");
  }
  // Handle ISO string or other date formats
  if (typeof lastUsedAt === "string") {
    const date = dayjs(lastUsedAt);
    if (date.isValid()) {
      return date.format("YYYY-MM-DD HH:mm:ss");
    }
  }
  return "Invalid Date";
};
export default function KeyTable({
  copy,
  openEditModal,
  loading,
  data,
  refresh,
}: {
  copy?: unknown;
  openEditModal?: (record: any) => void;
  loading: boolean;
  data: APIKey[];
  refresh: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [delModalVisible, setDelModalVisible] = useState(false);
  const [stringId, setStringId] = useState("");
  return (
    <>
      <Table loading={loading}>
        <TableHeader>
          <TableRow>
            <TableHead>{"Key Name"}</TableHead>
            <TableHead>{"API Key"}</TableHead>
            <TableHead>{"Expiration Time"}</TableHead>
            <TableHead>{"Created By"}</TableHead>
            <TableHead>{"Creation Time"}</TableHead>
            <TableHead>{"Last Used"}</TableHead>
            <TableHead>{"Operation"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((k: any) => (
            <TableRow key={k.key}>
              <TableCell>{k.name}</TableCell>
              <TableCell>{transformStr(k.key)}</TableCell>
              <TableCell>
                {k.expireTime ? k.expireTime : "Permanent validity"}
              </TableCell>
              <TableCell>
                <MemberCell member={k.createdBy} />
              </TableCell>
              <TableCell>{k.createTime}</TableCell>
              <TableCell>{formatLastUsedAt(k.lastUsedAt)}</TableCell>
              <TableCell>
                <div
                  className={cn(
                    "inline-flex items-center gap-2",
                    styles.operate_wrap,
                  )}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      openEditModal && openEditModal(k);
                    }}
                    id={CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_EDIT_KEY}
                  >
                    <PencilLine size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setStringId(k.stringId);
                      setDelModalVisible(true);
                    }}
                    id={CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_REMOVE_KEY}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DelKeyModal
        visible={delModalVisible}
        copy={copy}
        setVisible={setDelModalVisible}
        loading={deleting}
        onConfirm={() => {
          setDeleting(true);
          deleteUserKey(stringId)
            .then(() => {
              message.success("Delete successfully");
              setDelModalVisible(false);
              refresh();
            })
            .catch(() => {})
            .finally(() => {
              setDeleting(false);
            });
        }}
      />
    </>
  );
}
