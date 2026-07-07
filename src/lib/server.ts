import { cookies } from "next/headers";

export function getTokenCookie(): string {
  const tokenCookie = cookies().get("token");
  if (tokenCookie) {
    return tokenCookie.value
  }
  return ""
}