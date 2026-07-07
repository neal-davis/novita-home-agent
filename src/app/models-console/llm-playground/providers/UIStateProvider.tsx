"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ChatWidth } from "../constants";

interface UIStateContextValue {
  // Code drawer
  codeDrawerOpen: boolean;
  setCodeDrawerOpen: (open: boolean) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Chat width
  chatWidth: number;
  setChatWidth: (width: number) => void;
}

const UIStateContext = createContext<UIStateContextValue | null>(null);

interface UIStateProviderProps {
  children: ReactNode;
  chatContainerWidth?: number;
}

export function UIStateProvider({
  children,
  chatContainerWidth,
}: UIStateProviderProps) {
  const [codeDrawerOpen, setCodeDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatWidth, setChatWidth] = useState<number>(ChatWidth.NoLimit);

  useEffect(() => {
    if (chatContainerWidth !== undefined) {
      setChatWidth(chatContainerWidth);
    }
  }, [chatContainerWidth]);

  const value: UIStateContextValue = {
    codeDrawerOpen,
    setCodeDrawerOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    chatWidth,
    setChatWidth,
  };

  return (
    <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>
  );
}

export function useUIState() {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error("useUIState must be used within UIStateProvider");
  }
  return context;
}
