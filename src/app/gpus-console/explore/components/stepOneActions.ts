import Cookies from "js-cookie";
import { message } from "@/components/ui/standard/notify";
import { reqUploadUserRequestProduct } from "@/api/gpu-instance/explore";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { setUserState, UserState } from "@/store/slice/userSlice";
import { showPermissionMessage } from "@/lib/utils/permission";

export function handleCreateMyTemplate({
  userInfo,
  dispatch,
  router,
  path,
  locale,
  hasTemplateCreatePermission,
  setShowCreateTemplateModal,
}: any) {
  if (!userInfo || !userInfo.uuid) {
    const token: any = Cookies.get("token");
    if (token) {
      message.error("Login failure, please log in again");
    } else {
      message.error("Please log in first");
    }
    dispatch(setUserState(UserState.logout) as any);
    router.push(
      getLocalizedPath(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`, locale),
    );
    return;
  }
  if (hasTemplateCreatePermission) {
    setShowCreateTemplateModal(true);
  } else {
    showPermissionMessage();
  }
}

export function handleSubmitRequest({
  productName,
  gpuNum,
  userInfo,
  dispatch,
  router,
  path,
  locale,
}: any) {
  const isLogin = Boolean(Cookies.get("token"));
  if (!isLogin || !userInfo || !userInfo.uuid) {
    message.error("Please log in first");
    dispatch(setUserState(UserState.logout) as any);
    router.push(
      getLocalizedPath(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`, locale),
    );
    return;
  }
  const tmpStr =
    typeof window !== "undefined" ? localStorage.getItem("hasRequested") : null;
  try {
    const hasObj = JSON.parse(tmpStr || "{}") || {};
    if (hasObj[productName + "_" + gpuNum] === userInfo.uuid) {
      message.info(
        "We have received your request and will replenish it as soon as possible",
      );
    } else {
      reqUploadUserRequestProduct({
        userId: "" + userInfo.email,
        product: productName,
        cardNum: gpuNum,
        origin: typeof window !== "undefined" ? window.location.origin : "",
      }).then((res: any) => {
        message.success(
          "We have received your request and will replenish it as soon as possible",
        );
        hasObj[productName + "_" + gpuNum] = userInfo.uuid;
        if (typeof window !== "undefined") {
          localStorage.setItem("hasRequested", JSON.stringify(hasObj));
        }
      });
    }
  } catch (e) {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasRequested", "{}");
    }
  }
}

export function handleOpenCreateNetworkVolume({
  userInfo,
  dispatch,
  router,
  path,
  hasStorageCreatePermission,
  setShowVolumeModal,
}: any) {
  if (!userInfo || JSON.stringify(userInfo) === "{}") {
    message.error("Please log in first");
    dispatch(setUserState(UserState.logout) as any);
    router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${path}`);
    return;
  }
  if (hasStorageCreatePermission) {
    setShowVolumeModal(true);
    return;
  }
  showPermissionMessage();
}
