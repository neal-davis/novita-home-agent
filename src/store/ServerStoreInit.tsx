import { cookies } from "next/headers";
import { setToken } from "@/store/slice/userSlice";
import { useAppDispatch } from "@/store";

export default function ServerStoreInit() {
  const token = cookies().get("token")
  const dispatch = useAppDispatch()
  if (token) {
    dispatch(setToken(token.value))
  }
  return <></>
}