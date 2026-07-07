"use client";
import { useCallback, useEffect, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import { Skeleton as Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateUserInfo } from "@/api/user";
import styles from "./index.module.scss";
import { fetchUserInfo } from "@/store/slice/userSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { ChevronRight } from "lucide-react";
type Iprops = {
  copy?: unknown;
};
export default function Account(props: Iprops) {
  const { copy } = props;
  const uuid = useAppSelector((state) => state.user.uuid) ?? "";
  const email = useAppSelector((state) => state.user.email) ?? "";
  const firstName = useAppSelector((state) => state.user.firstName) ?? "";
  const lastName = useAppSelector((state) => state.user.lastName) ?? "";
  const companyName = useAppSelector((state) => state.user.companyName) ?? "";
  const country = useAppSelector((state) => state.user.country) ?? "";
  const isQuestionnaire = useAppSelector((state) => state.user.isQuestionnaire);
  const dispatch = useAppDispatch();
  const router = useRouter();
  useEffect(() => {
    if (window) {
      const hash = window.location.hash.slice(1);
      if (hash === "key-management") {
        router.push(`/settings/key-management`);
      }
    }
  }, [router]);
  const [form, setForm] = useState({
    firstName,
    lastName,
    companyName,
    country,
  });
  useEffect(() => {
    setForm({
      firstName,
      lastName,
      companyName,
      country,
    });
  }, [firstName, lastName, companyName, country]);
  const onFinish = useCallback(
    async (values: userUpdateSchema) => {
      try {
        await updateUserInfo(values);
        message.success("Save account info success");
        dispatch(fetchUserInfo() as any);
      } catch {
        message.error("Save account info failed");
      }
    },
    [dispatch],
  );
  return (
    <div>
      {isQuestionnaire === false && (
        <div className={`flex flex-row ${styles.tips}`}>
          <p>Complete a quick survey</p>
          <Button variant="link" className="h-5" size="sm" asChild>
            <Link href={NOVITA_URL.CONSOLE}>
              Go to Settings
              <ChevronRight className="h-[14px] w-[14px]" />
            </Link>
          </Button>
        </div>
      )}
      <div className="console-card">
        <div
          className={`flex flex-col md:flex-row justify-between gap-5 ${styles.row}`}
        >
          <div className={`flex-1 ${styles.item_wrap}`}>
            <p className={styles.label}>{"Email"}</p>
            <Skeleton
              loading={!email}
              active
              paragraph={{ rows: 0 }}
              style={{ marginTop: 14, display: "inline-table" }}
            >
              <p className={`${styles.value} font-body-medium`}>{email}</p>
            </Skeleton>
          </div>
          <div className={`flex-1 ${styles.item_wrap}`}>
            <p className={styles.label}>{"User ID"}</p>
            <Skeleton
              loading={!email}
              active
              paragraph={{ rows: 0 }}
              style={{ marginTop: 14, display: "inline-table" }}
            >
              <p className={styles.value}>{uuid}</p>
            </Skeleton>
          </div>
        </div>

        {uuid ? (
          <div>
            <div
              className={`flex flex-col md:flex-row justify-between gap-5 ${styles.row}`}
            >
              <div className={`flex-1 ${styles.item_wrap}`}>
                <p className={styles.label}>{"First Name"}</p>
                <Input
                  placeholder={"First Name"}
                  value={form.firstName}
                  onChange={(e) => {
                    setForm({ ...form, firstName: e.target.value });
                  }}
                />
              </div>
              <div className={`flex-1 ${styles.item_wrap}`}>
                <p className={styles.label}>{"Last Name"}</p>
                <Input
                  placeholder={"Last Name"}
                  value={form.lastName}
                  onChange={(e) => {
                    setForm({ ...form, lastName: e.target.value });
                  }}
                />
              </div>
            </div>
            <div
              className={`flex flex-col md:flex-row justify-between gap-5 ${styles.row}`}
            >
              <div className={`flex-1 ${styles.item_wrap}`}>
                <p className={styles.label}>{"Company Name"}</p>
                <Input
                  placeholder={"Company Name"}
                  value={form.companyName}
                  onChange={(e) => {
                    setForm({ ...form, companyName: e.target.value });
                  }}
                />
              </div>
              <div className={`flex-1 ${styles.item_wrap}`}>
                <p className={styles.label}>{"Country"}</p>
                <Input
                  placeholder={"Country"}
                  value={form.country}
                  onChange={(e) => {
                    setForm({ ...form, country: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div
              className={`flex flex-col md:flex-row justify-between gap-5 ${styles.row}`}
            >
              <div className={`flex-1 ${styles.item_wrap}`}>
                <p className={styles.label}>{"First Name"}</p>
                <Input placeholder={"First Name"} disabled />
              </div>
              <div className={`flex-1 ${styles.item_wrap}`}>
                <p className={styles.label}>{"Last Name"}</p>
                <Input placeholder={"Last Name"} disabled />
              </div>
            </div>
            <div
              className={`flex flex-col md:flex-row justify-between gap-5 ${styles.row}`}
            >
              <div className={`flex-1 ${styles.item_wrap}`}>
                <p className={styles.label}>{"Company Name"}</p>
                <Input placeholder={"Company Name"} disabled />
              </div>
              <div className={`flex-1 ${styles.item_wrap}`}>
                <p className={styles.label}>{"Country"}</p>
                <Input placeholder={"Country"} disabled />
              </div>
            </div>
          </div>
        )}

        <div
          className={`flex flex-col md:flex-row justify-between gap-5 ${styles.row}`}
        >
          <div className={`flex-1 ${styles.item_wrap}`}>
            <p className={styles.label}>{"Password"}</p>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1">
                <Input value="*** *** ***" disabled className="w-full" />
              </div>
              <Button
                size="sl"
                asChild
                variant="outline"
                id={CLICK_BTN_IDs.SETTINGS.ACCOUNT_SETTINGS_PASSWORD_CHANGE}
              >
                <Link
                  href={`${NOVITA_URL.USER_RESET_PASSWORD}?from=console&email=${email}`}
                >
                  {"Change"}
                </Link>
              </Button>
            </div>
          </div>
          <div className={`flex-1 ${styles.item_wrap}`}></div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sl"
            style={{
              width: 200,
            }}
            variant="secondary"
            onClick={() => {
              onFinish(form);
            }}
            disabled={!uuid}
            id={CLICK_BTN_IDs.SETTINGS.ACCOUNT_SETTINGS_SAVE}
          >
            {"Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
