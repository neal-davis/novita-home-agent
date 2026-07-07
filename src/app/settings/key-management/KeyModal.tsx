"use client";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import styles from "./index.module.scss";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
export const defaultKeyData = {
  id: "0",
  stringId: "",
  name: "",
  key: "",
  secret: "",
  expireTime: "",
  createTime: "",
};
export type KeyData = typeof defaultKeyData;
export default function KeyModal({
  copy,
  type,
  visible,
  setVisible,
  keyValue = defaultKeyData,
  onConfirm,
  loading,
}: {
  copy?: unknown;
  type: "update" | "add";
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  keyValue?: KeyData;
  onConfirm?: (data: KeyData) => void;
  loading?: boolean;
}) {
  const [keyData, setKeyData] = useState(defaultKeyData);
  useEffect(() => {
    if (type == "update") {
      setKeyData(keyValue);
    }
  }, [type, keyValue]);
  useEffect(() => {
    if (visible && type == "add") {
      setKeyData(defaultKeyData);
    }
  }, [visible, type]);
  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type == "add" ? "Add API Key" : "Modify API Key"}
          </DialogTitle>
          <DialogDescription>
            {"Up to 10 keys can be generated per account."}
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className={styles.modal_line}>
            <div className={styles.modal_line_title}>{"Key Name"}</div>
            <div>
              <Input
                placeholder={"Input your key name"}
                value={keyData.name}
                onChange={(e) => {
                  const data = { ...keyData };
                  data.name = e.target.value;
                  setKeyData(data);
                }}
                className={styles.input}
              />
            </div>
          </div>
          {type == "update" && (
            <div className={styles.modal_line}>
              <div className={styles.modal_line_title}>{"API Key"}</div>
              <div>
                <Input
                  placeholder={"Input your API Key"}
                  value={keyData.key}
                  className={styles.input}
                  readOnly
                  disabled
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            size="sl"
            variant="outline"
            onClick={() => {
              setVisible(false);
              analytics.trackClick(
                type === "add"
                  ? CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_ADD_KEY_CANCEL
                  : CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_EDIT_KEY_CANCEL,
              );
            }}
          >
            {"Cancel"}
          </Button>
          <Button
            size="sl"
            variant="secondary"
            style={{ marginLeft: "var(--spacing-button) !important" }}
            disabled={loading}
            onClick={() => {
              onConfirm && onConfirm(keyData);
              analytics.trackClick(
                type === "add"
                  ? CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_ADD_KEY_SUBMIT
                  : CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_EDIT_KEY_CONFIRM,
              );
            }}
          >
            {"Confirm"}
            {loading && <Loader2 size={16} className="ml-2 animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
