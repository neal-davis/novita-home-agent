import { redirect } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";

export default function SettingsPage() {
  redirect(NOVITA_URL.SETTINGS_ACCOUNT);
}
