import { useEffect } from "react";
import { mobileCheck } from "@/lib/utils/utils";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { setIsMobile } from "@/store/slice/configSlice";

export function useIsMobile() {
  const dispatch = useAppDispatch();
  const isMobile = useAppSelector((state: RootState) => state.config.isMobile);

  useEffect(() => {
    const checkIsMobile = () => {
      dispatch(setIsMobile(mobileCheck()));
    };
    setTimeout(() => {
      checkIsMobile();
    }, 100);

    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [dispatch]);

  return isMobile;
}
