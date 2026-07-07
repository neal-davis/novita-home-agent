import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store";
import { NOVITA_URL } from "@/constants/urls";

/**
 * Hook to guard user actions that require authentication
 * Redirects to login page if user is not authenticated
 */
export function useLoginGuard() {
  const uuid = useAppSelector((state) => state.user.uuid);
  const path = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  /**
   * Check if user is logged in, redirect to login if not
   * @returns true if user is authenticated, false otherwise
   */
  const checkLogin = useCallback(() => {
    if (!uuid) {
      // Construct full URL with search params
      const queryString = searchParams.toString();
      const fullPath = queryString ? `${path}?${queryString}` : path;
      const encodedRedirect = encodeURIComponent(fullPath);

      router.push(`${NOVITA_URL.USER_LOGIN}?redirect=${encodedRedirect}`);
      return false;
    }
    return true;
  }, [uuid, path, searchParams, router]);

  return {
    isLoggedIn: !!uuid,
    checkLogin,
  };
}
