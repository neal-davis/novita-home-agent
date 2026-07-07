"use client";

import { useMemo } from "react";
import Cookies from "js-cookie";

export function useSelectKeys(): string[] {
  const token = Cookies.get("token");
  const keys = useMemo(() => (token ? [`session_${token}`] : []), [token]);
  return keys;
}
