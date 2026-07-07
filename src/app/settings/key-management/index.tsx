"use client";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { message } from "@/components/ui/standard/notify";
import { Plus } from "lucide-react";
import KeyTable from "./KeyTable";
import KeyModal, { defaultKeyData } from "./KeyModal";
import { addUserKey, updateUserKey } from "@/api/user";
import styles from "./index.module.scss";
import { useAppDispatch } from "@/store";
import { fetchUserInfo } from "@/store/slice/userSlice";
import { PERMISSION } from "@/constants/constants";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { Button } from "@/components/ui/button";
import { getUserKey } from "@/api/user";
import { TeamRole } from "@/store/slice/userSlice";
import { useAppSelector } from "@/store";
import APIKeyAlert from "./APIKeyAlert";
import Alert from "@/components/ui/standard/alert";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
type Iprops = {
  copy?: unknown;
};
export type APIKey = {
  key: string;
  name: string;
  expireTime: string;
  createdBy: {
    alias: string;
    phone: string;
    email: string;
  };
  createTime: string;
  lastUseAt: string;
};
const KEY_MANAGEMENT_ID = "key-management";
export default function KeyContainer(props: Iprops) {
  const { copy } = props;
  const [type, setType] = useState<"update" | "add">("add");
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [newAPIKey, setNewAPIKey] = useState("");
  const [keyValue, setKeyValue] = useState(defaultKeyData);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const dispatch = useAppDispatch();
  const selfEmail = useAppSelector((state) => state.user.email);
  const selfPhone = useAppSelector((state) => state.user.mobilePhone);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const allTeamMembers = useAppSelector((state) => state.user.allTeamMembers);
  const fillAPIKeys = useCallback(() => {
    if (currentTeam && allTeamMembers.length === 0) {
      return;
    }
    setLoading(true);
    getUserKey()
      .then((res) => {
        setApiKeys(
          res.keys.map((k: any) => {
            const createdBy = { alias: "", phone: "", email: "" };
            if (currentTeam === null) {
              createdBy.phone = selfPhone;
              createdBy.email = selfEmail;
            } else {
              if (k.memberId) {
                const member = allTeamMembers.find(
                  (m) => m.memberId === k.memberId,
                );
                if (member) {
                  createdBy.phone = member.phone;
                  createdBy.email = member.email;
                  createdBy.alias = member.alias;
                }
              } else {
                const owner = allTeamMembers.find(
                  (m) => m.role === TeamRole.owner,
                );
                if (owner) {
                  createdBy.phone = owner.phone;
                  createdBy.email = owner.email;
                  createdBy.alias = owner.alias;
                }
              }
            }
            return {
              key: k.maskedKey,
              stringId: k.stringId,
              name: k.name,
              expireTime: k.expireTime,
              createdBy: createdBy,
              createTime: k.createTime,
              lastUsedAt: k.lastUsedAt || "-1",
            };
          }),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selfEmail, selfPhone, currentTeam, allTeamMembers]);
  useEffect(() => {
    fillAPIKeys();
  }, [allTeamMembers, fillAPIKeys]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (searchParams?.get("action") === "add") {
      setType("add");
      setKeyModalVisible(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("action");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);
  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.key_management}
      resource={PERMISSION.RESOURCE.key_management}
      action={PERMISSION.ACTION.read}
    >
      <div>
        <Button
          size="sl"
          variant="secondary"
          onClick={() => {
            setType("add");
            setKeyModalVisible(true);
          }}
          id={CLICK_BTN_IDs.SETTINGS.KEY_MANAGEMENT_ADD_KEY}
        >
          <Plus size={14} className="mr-2" />
          <span>{"Add New Key"}</span>
        </Button>
      </div>
      <div
        className={`${styles.key_container} console-card mt-4`}
        id={KEY_MANAGEMENT_ID}
      >
        <Alert
          title=""
          content={[
            "For improved security, API keys are now encrypted. Existing API keys will no longer be visible in plaintext after creation. Please make sure to copy your key when it's generated, as it cannot be retrieved afterward. If you have any questions, please contact support.",
          ]}
          className="mb-6"
        />

        <KeyTable
          copy={copy}
          data={apiKeys}
          loading={loading}
          openEditModal={(record: any) => {
            setType("update");
            setKeyValue(record);
            setKeyModalVisible(true);
          }}
          refresh={fillAPIKeys}
        />
        <KeyModal
          keyValue={keyValue}
          copy={copy}
          visible={keyModalVisible}
          setVisible={setKeyModalVisible}
          type={type}
          loading={modalLoading}
          onConfirm={(data) => {
            setModalLoading(true);
            if (type == "add") {
              addUserKey({
                name: data.name,
                expireTime: data.expireTime,
              })
                .then((res) => {
                  setKeyModalVisible(false);
                  setNewAPIKey(res.apiKey);
                  dispatch(fetchUserInfo() as any);
                  fillAPIKeys();
                })
                .catch(() => {})
                .finally(() => {
                  setModalLoading(false);
                });
            } else if (type == "update") {
              updateUserKey({
                name: data.name,
                stringId: data.stringId,
              })
                .then(() => {
                  message.success("Update successfully");
                  setKeyModalVisible(false);
                  dispatch(fetchUserInfo() as any);
                  fillAPIKeys();
                })
                .catch(() => {})
                .finally(() => {
                  setModalLoading(false);
                });
            }
          }}
        />
        {newAPIKey && (
          <APIKeyAlert apiKey={newAPIKey} setNewAPIKey={setNewAPIKey} />
        )}
      </div>
    </PermissionWrapper>
  );
}
