import { checkServerlessAccess } from "./user";

export function GetIsServerlessAuth(
  isLogin: boolean,
  mobilePhone: string,
  email: string,
  uuid: string,
) {
  if (isLogin) {
    const auth = checkServerlessAccess({
      email,
      mobilePhone,
      uuid,
    });
    return auth;
  } else {
    return false;
  }
}
