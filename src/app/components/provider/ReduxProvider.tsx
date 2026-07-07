"use client";

import { useRef } from "react";
import { initStore, reduxStore } from "@/store";
import { Provider } from "react-redux";

export function ReduxProvider({
  children,
  initState,
}: {
  children: React.ReactNode;
  initState?: any;
}) {
  // Use useRef to ensure the store is created only once, even if the component re-renders
  const storeRef = useRef<ReturnType<typeof initStore>>();

  if (!storeRef.current) {
    // Create the store only during the initial render
    storeRef.current = initStore(initState);
    reduxStore.setStore(storeRef.current);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
